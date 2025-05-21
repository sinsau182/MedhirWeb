import GlobalLoading from './GlobalLoading';
import PasswordChangeAlert from './PasswordChangeAlert';

const Layout = ({ children }) => {
  return (
    <>
      <GlobalLoading />
      <PasswordChangeAlert />
      {children}
    </>
  );
};

export default Layout; 