"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Eye, ExternalLink } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchPage, clearCurrentPage, updatePageMeta, addBlock, editBlock, removeBlock, reorderBlocks, reorderLocally, updateBlockLocally, initialContentState } from "@/store/slices/contentSlice";
import type { Block, BlockType } from "@/lib/types";
import BlockCard from "@/components/blocks/BlockCard";
import AddBlockMenu from "@/components/blocks/AddBlockMenu";
import { defaultDataFor } from "@/components/blocks/defaults";

export default function PageEditor() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentPage } = useAppSelector((s) => s.content ?? initialContentState);
  const [title, setTitle] = useState("");
  const [savingMeta, setSavingMeta] = useState(false);
  const debounceRefs = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    dispatch(fetchPage(id));
    return () => {
      dispatch(clearCurrentPage());
    };
  }, [id, dispatch]);

  useEffect(() => {
    if (currentPage) setTitle(currentPage.title);
    // Only re-sync the local title input when a different page loads, not on every keystroke re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage?.id]);

  const blocks = currentPage?.blocks || [];

  async function handleTitleBlur() {
    if (!currentPage || title === currentPage.title) return;
    setSavingMeta(true);
    await dispatch(updatePageMeta({ id: currentPage.id, title }));
    setSavingMeta(false);
  }

  async function togglePublish() {
    if (!currentPage) return;
    setSavingMeta(true);
    await dispatch(updatePageMeta({ id: currentPage.id, status: currentPage.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" }));
    setSavingMeta(false);
  }

  function handleAddBlock(type: BlockType) {
    if (!currentPage) return;
    const order = blocks.length ? Math.max(...blocks.map((b) => b.order)) + 1 : 0;
    dispatch(addBlock({ pageId: currentPage.id, type, order, data: defaultDataFor(type) }));
  }

  // Local Redux state updates instantly on every keystroke so inputs stay
  // responsive; the network persist is debounced so rapid typing doesn't
  // fire a request per keystroke.
  const handleBlockChange = useCallback(
    (block: Block, data: Block["data"]) => {
      dispatch(updateBlockLocally({ id: block.id, data }));
      clearTimeout(debounceRefs.current[block.id]);
      debounceRefs.current[block.id] = setTimeout(() => {
        dispatch(editBlock({ id: block.id, data }));
      }, 600);
    },
    [dispatch]
  );

  function handleDeleteBlock(blockId: string) {
    dispatch(removeBlock(blockId));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !currentPage) return;

    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);
    const reordered = arrayMove(blocks, oldIndex, newIndex).map((b, idx) => ({ ...b, order: idx }));

    dispatch(reorderLocally(reordered));
    dispatch(
      reorderBlocks({
        pageId: currentPage.id,
        blocks: reordered.map((b) => ({ id: b.id, order: b.order })),
      })
    );
  }

  if (!currentPage) {
    return <div className="p-10 text-sm text-ash">Loading page…</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      <button onClick={() => router.push("/pages")} className="mb-4 flex items-center gap-1.5 text-xs text-ash hover:text-ink">
        <ArrowLeft size={13} /> All pages
      </button>

      <div className="mb-6 rounded-lg border border-line bg-canvas p-5 shadow-panel">
        <div className="flex items-start justify-between gap-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            className="flex-1 border-none bg-transparent font-display text-xl font-semibold text-ink outline-none"
          />
          <div className="flex shrink-0 items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                currentPage.status === "PUBLISHED" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
              }`}
            >
              {savingMeta ? "Saving…" : currentPage.status}
            </span>
            <button
              onClick={togglePublish}
              className="flex items-center gap-1.5 rounded bg-ink px-3 py-1.5 text-xs font-medium text-white hover:bg-ink-soft"
            >
              <Eye size={13} />
              {currentPage.status === "PUBLISHED" ? "Unpublish" : "Publish"}
            </button>
            {currentPage.status === "PUBLISHED" && (
              <a
                href={`${process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || "http://localhost:3001"}/${currentPage.slug}`}
                target="_blank"
                rel="noreferrer"
                className="text-ash hover:text-accent"
              >
                <ExternalLink size={15} />
              </a>
            )}
          </div>
        </div>
        <p className="mt-1 font-mono text-xs text-ash">/{currentPage.slug}</p>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {blocks.map((block) => (
              <BlockCard
                key={block.id}
                block={block}
                onChange={(data) => handleBlockChange(block, data)}
                onDelete={() => handleDeleteBlock(block.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="mt-3">
        <AddBlockMenu onAdd={handleAddBlock} />
      </div>
    </div>
  );
}
