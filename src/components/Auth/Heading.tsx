type Props = {
  isLogin: boolean;
};

export default function Heading({ isLogin }: Props) {
  return (
    <div className="text-center mb-6">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900">
        {isLogin ? "Welcome back" : "Create your account"}
      </h1>
      <p className="mt-1.5 text-sm text-gray-500">
        {isLogin
          ? "Enter your details to access the platform"
          : "Get started with Meeting Room Booking App"}
      </p>
    </div>
  );
}
