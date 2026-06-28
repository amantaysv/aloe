export default function MobileHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="md:hidden fixed rounded-2xl top-0 right-0 left-0 bg-linear-to-t from-white to-green-100 p-4 z-50">
      {children}
    </div>
  );
}
