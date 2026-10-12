import { Dispatch, SetStateAction } from "react";

type Props = {
  isLogin: boolean;
  setIsLogin: Dispatch<SetStateAction<boolean>>;
  setError: Dispatch<SetStateAction<string>>;
};

export default function Tabs({ setError, setIsLogin, isLogin }: Props) {
  return (
    <div className="flex p-1 bg-gray-100 rounded-xl mb-8">
      <button
        type="button"
        onClick={() => {
          setIsLogin(true);
          setError("");
        }}
        className={`flex-1 text-sm font-medium py-2 rounded-lg transition-all duration-200 ${
          isLogin
            ? "bg-white text-gray-900 shadow-sm font-semibold"
            : "text-gray-500 hover:text-gray-900"
        }`}
      >
        Sign In
      </button>
      <button
        type="button"
        onClick={() => {
          setIsLogin(false);
          setError("");
        }}
        className={`flex-1 text-sm font-medium py-2 rounded-lg transition-all duration-200 ${
          !isLogin
            ? "bg-white text-gray-900 shadow-sm font-semibold"
            : "text-gray-500 hover:text-gray-900"
        }`}
      >
        Register
      </button>
    </div>
  );
}
