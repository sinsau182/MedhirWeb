import GlobalLoading from './GlobalLoading';

const Layout = ({ children }) => {
  return (
    <>
      <GlobalLoading />
      {children}
    </>
  );
};

export default Layout; 