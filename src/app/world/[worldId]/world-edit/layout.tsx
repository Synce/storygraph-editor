const RootLayout = ({children}: {children: React.ReactNode}) => {
  return (
    <div className="flex h-full flex-col">
      <div className="bg-slate-800 p-4">
        <h1 className="text-white">{'Edycja świata'}</h1>
      </div>
      <main className="flex flex-1">{children}</main>
    </div>
  );
};
export default RootLayout;
