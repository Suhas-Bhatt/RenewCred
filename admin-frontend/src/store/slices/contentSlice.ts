import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { api } from "@/lib/api";
import type { Block, BlockData, BlockType, Page } from "@/lib/types";

// Design decision: Redux owns the currently-open page + its blocks because
// three independent UI regions (block canvas, inspector panel, reorder
// toolbar) all read and mutate the same list. Ephemeral things — which
// block is selected, whether a modal is open, unsaved draft text in an
// input before it's committed — stay as local useState in the relevant
// component, since no sibling needs them and putting them in Redux would
// just add dispatch noise for zero cross-component benefit.
interface ContentState {
  pages: Page[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number } | null;
  currentPage: Page | null;
  status: "idle" | "loading" | "saving" | "error";
  error: string | null;
}

export const initialContentState: ContentState = {
  pages: [],
  pagination: null,
  currentPage: null,
  status: "idle",
  error: null,
};

export const fetchPages = createAsyncThunk("content/fetchPages", async (params: { page?: number; pageSize?: number; status?: string } = {}) => {
  const res = await api.get("/pages", { params });
  return res.data;
});

export const fetchPage = createAsyncThunk("content/fetchPage", async (id: string) => {
  const res = await api.get(`/pages/${id}`);
  return res.data.data as Page;
});

export const createPage = createAsyncThunk(
  "content/createPage",
  async (payload: { title: string; slug?: string; status?: "DRAFT" | "PUBLISHED" }) => {
    const res = await api.post("/pages", payload);
    return res.data.data as Page;
  }
);

export const updatePageMeta = createAsyncThunk(
  "content/updatePageMeta",
  async ({ id, ...payload }: { id: string } & Partial<Pick<Page, "title" | "slug" | "status" | "seoTitle" | "seoDescription">>) => {
    const res = await api.patch(`/pages/${id}`, payload);
    return res.data.data as Page;
  }
);

export const deletePage = createAsyncThunk("content/deletePage", async (id: string) => {
  await api.delete(`/pages/${id}`);
  return id;
});

export const addBlock = createAsyncThunk(
  "content/addBlock",
  async ({ pageId, type, order, data }: { pageId: string; type: BlockType; order: number; data: BlockData }) => {
    const res = await api.post(`/pages/${pageId}/blocks`, { type, order, data });
    return res.data.data as Block;
  }
);

export const editBlock = createAsyncThunk(
  "content/editBlock",
  async ({ id, data }: { id: string; data: BlockData }) => {
    const res = await api.patch(`/blocks/${id}`, { data });
    return res.data.data as Block;
  }
);

export const removeBlock = createAsyncThunk("content/removeBlock", async (id: string) => {
  await api.delete(`/blocks/${id}`);
  return id;
});

export const reorderBlocks = createAsyncThunk(
  "content/reorderBlocks",
  async ({ pageId, blocks }: { pageId: string; blocks: { id: string; order: number }[] }) => {
    const res = await api.patch(`/pages/${pageId}/blocks/reorder`, { blocks });
    return res.data.data as Block[];
  }
);

const contentSlice = createSlice({
  name: "content",
  initialState: initialContentState,
  reducers: {
    clearCurrentPage(state) {
      state.currentPage = null;
    },
    // Optimistic local reorder while a drag is in progress; the thunk above
    // persists it and reconciles with the server response on settle.
    reorderLocally(state, action: PayloadAction<Block[]>) {
      if (state.currentPage) state.currentPage.blocks = action.payload;
    },
    // Instant local edit so inputs feel responsive on every keystroke; the
    // editBlock thunk (debounced by the caller) persists it shortly after
    // and reconciles with the server response.
    updateBlockLocally(state, action: PayloadAction<{ id: string; data: BlockData }>) {
      if (!state.currentPage?.blocks) return;
      state.currentPage.blocks = state.currentPage.blocks.map((b) =>
        b.id === action.payload.id ? { ...b, data: action.payload.data } : b
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPages.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPages.fulfilled, (state, action) => {
        state.status = "idle";
        state.pages = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchPages.rejected, (state, action) => {
        state.status = "error";
        state.error = action.error.message || "Failed to load pages";
      })
      .addCase(fetchPage.fulfilled, (state, action) => {
        state.currentPage = action.payload;
      })
      .addCase(createPage.fulfilled, (state, action) => {
        state.pages.unshift(action.payload);
      })
      .addCase(updatePageMeta.fulfilled, (state, action) => {
        if (state.currentPage?.id === action.payload.id) {
          state.currentPage = { ...state.currentPage, ...action.payload };
        }
        state.pages = state.pages.map((p) => (p.id === action.payload.id ? { ...p, ...action.payload } : p));
      })
      .addCase(deletePage.fulfilled, (state, action) => {
        state.pages = state.pages.filter((p) => p.id !== action.payload);
      })
      .addCase(addBlock.fulfilled, (state, action) => {
        if (state.currentPage) {
          state.currentPage.blocks = [...(state.currentPage.blocks || []), action.payload].sort(
            (a, b) => a.order - b.order
          );
        }
      })
      .addCase(editBlock.fulfilled, (state, action) => {
        if (state.currentPage?.blocks) {
          state.currentPage.blocks = state.currentPage.blocks.map((b) =>
            b.id === action.payload.id ? action.payload : b
          );
        }
      })
      .addCase(removeBlock.fulfilled, (state, action) => {
        if (state.currentPage?.blocks) {
          state.currentPage.blocks = state.currentPage.blocks.filter((b) => b.id !== action.payload);
        }
      })
      .addCase(reorderBlocks.fulfilled, (state, action) => {
        if (state.currentPage) state.currentPage.blocks = action.payload;
      });
  },
});

export const { clearCurrentPage, reorderLocally, updateBlockLocally } = contentSlice.actions;
export default contentSlice.reducer;
