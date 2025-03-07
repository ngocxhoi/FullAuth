import type { User } from "~/lib/type";

export const useStateStore = () => {
  const userData = useState<User | null>("userData", () => null);
  const openAsideBar = useState<boolean>("openAsideBar", () => false);

  return { userData, openAsideBar };
};
