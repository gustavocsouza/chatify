import { create } from "zustand";

export const useAuthStore = create((set) => ({
  authUser: {
    name: "John",
    _id: 123,
    age: 21,
  },
  isLoading: true,
  login: () => {
    console.log("We just logged in");
    set({ isLoading: false });
  },
}));  