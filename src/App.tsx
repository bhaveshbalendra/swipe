import { DashboardOutlined, UserOutlined } from "@ant-design/icons";
import { ConfigProvider, Layout, Spin, Tabs } from "antd";
import { Toaster } from "react-hot-toast";
import { Provider, useDispatch } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { useAppSelector } from "./hooks/useAppSelector";
import IntervieweePage from "./pages/IntervieweePage";
import InterviewerPage from "./pages/InterviewerPage";
import { persistor, store } from "./store";
import { setCurrentTab } from "./store/slices/appSlice";

const { Content } = Layout;

const AppContent: React.FC = () => {
  const dispatch = useDispatch();
  const activeTab = useAppSelector((state) => state.app.currentTab);

  const handleTabChange = (key: string) => {
    dispatch(
      setCurrentTab(key as "interviewee" | "interviewer" | "validation")
    );
  };

  const tabItems = [
    {
      key: "interviewee",
      label: (
        <span>
          <UserOutlined />
          Interviewee
        </span>
      ),
      children: <IntervieweePage />,
    },
    {
      key: "interviewer",
      label: (
        <span>
          <DashboardOutlined />
          Interviewer
        </span>
      ),
      children: <InterviewerPage />,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content style={{ padding: "24px" }}>
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={tabItems}
          size="large"
          style={{ marginBottom: "24px" }}
        />
      </Content>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#4ade80",
              secondary: "#fff",
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <Spin
            size="large"
            style={{ display: "block", margin: "50px auto" }}
          />
        }
        persistor={persistor}
      >
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: "#1890ff",
              borderRadius: 6,
            },
          }}
        >
          <AppContent />
        </ConfigProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
