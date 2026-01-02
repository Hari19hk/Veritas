import Layout from './Layout';

const DashboardShell = ({ children, breadcrumb }: any) => {
  return (
    <Layout breadcrumb={breadcrumb}>
      {children}
    </Layout>
  );
};

export default DashboardShell;
