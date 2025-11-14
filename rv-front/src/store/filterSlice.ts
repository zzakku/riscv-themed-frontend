import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface FilterState {
  searchQuery: string;
}

const initialState: FilterState = {
  searchQuery: '',
};

const filterSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    // resetFilters: (state) => {
    //   state.searchQuery = '';
    // },
    // clearSearch: (state) => {
    //   state.searchQuery = '';
    // }
  },
});

export const { setSearchQuery } = filterSlice.actions;

export default filterSlice.reducer;