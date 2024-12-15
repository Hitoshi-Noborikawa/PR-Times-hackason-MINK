interface HomeLayoutProps {
    children: React.ReactNode
  }
  
  const HomeLayout = async ({ children }: HomeLayoutProps) => {
    return <div className="w-full mx-auto max-w-screen-lg px-2 my-10">{children}</div>
  }
  
  export default HomeLayout