import { CSSProperties, useEffect, useState } from "react";
import { useUser } from "./Provider.tsx";
import { apiService } from "./utils/apiWrapper.ts";
import { getBrowserInfoWithHash } from "./utils/deviceFingerprinter.ts";

const styles: { [key: string]: CSSProperties } = {
  container: {
    display: "flex",
    height: "100vh",
  },
  authHalf: {
    flex: 1,
    padding: "20px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#e6f3ff",
  },
  titleContainer: {
    textAlign: "center",
    marginBottom: "20px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#0056b3",
    marginBottom: "5px",
  },
  subtitle: {
    fontSize: "18px",
    color: "#0077cc",
  },
  authForm: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "25px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    width: "100%",
    maxWidth: "400px",
  },
  inputGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    marginBottom: "5px",
    fontWeight: "bold",
    color: "#333",
  },
  input: {
    width: "95%",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "14px",
  },
  button: {
    width: "100%",
    padding: "10px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    transition: "background-color 0.3s",
    marginTop: "10px",
  },
  submitButton: {
    backgroundColor: "#0056b3",
    color: "white",
  },
  logoutButton: {
    backgroundColor: "#ee707c",
    color: "white",
  },
  modeButton: {
    backgroundColor: "#5cb85c",
    color: "white",
  },
  tabContainer: {
    display: "flex",
    width: "100%",
    maxWidth: "400px",
    marginBottom: "10px",
  },
  tab: {
    flex: 1,
    padding: "10px",
    textAlign: "center",
    cursor: "pointer",
    borderRadius: "8px 8px 0 0",
    fontWeight: "bold",
  },
  activeTab: {
    backgroundColor: "white",
    color: "#0056b3",
    borderBottom: "none",
  },
  inactiveTab: {
    backgroundColor: "#b3d9ff",
    color: "#333",
  },
};

interface AuthProps {
  side: "left" | "right";
}

type AuthMode = "basic" | "account";

export default function Auth({ side }: AuthProps) {
  // 基本登入模式的狀態
  const [alias, setAlias] = useState("");
  const [pin, setPin] = useState("");
  const [password, setPassword] = useState("");
  const [ip, setIp] = useState("");
  const [fingerPrint, setFingerPrint] = useState("");

  // 帳號密碼登入模式的狀態
  const [username, setUsername] = useState("");
  const [accountPassword, setAccountPassword] = useState("");
  const [uuid, setUuid] = useState("");

  // 當前登入模式
  const [authMode, setAuthMode] = useState<AuthMode>("basic");

  const user = useUser();

  useEffect(() => {
    // get local browser fingerprint
    getBrowserInfoWithHash()
      .then((hash) => setFingerPrint(hash))
      .catch((e) => console.error("get fingerprint error: ", e));
    // get local ip address
    fetch("https://api.ipify.org?format=json")
      .then((res) => res.json())
      .then((data) => setIp(data.ip))
      .catch((e) => console.error("get ip error: ", e));
  }, []);

  const handleBasicLogin = async () => {
    try {
      const res = await apiService.login({
        username: alias,
        password: pin,
        token: password,
        ip: ip,
        fingerPrint: fingerPrint,
      });
      console.log(res);
      if (res.result) {
        user.setUid(res.uuid as string);
        alert("登入成功[debug] " + res.uuid);
        return;
      }
      alert("登入失敗, e: " + res.message);
    } catch (e) {
      alert("登入失敗, e: " + e);
    }
  };

  const handleAccountLogin = async () => {
    try {
      const res = await apiService.accountLogin({
        username: username,
        password: accountPassword,
        uuid: uuid || undefined, // 只在有值時傳入 UUID
      });
      console.log(res);
      if (res.result) {
        user.setUid(res.uuid as string);
        alert("帳號登入成功[debug] " + res.uuid);
        return;
      }
      alert("帳號登入失敗, e: " + res.message);
    } catch (e) {
      alert("帳號登入失敗, e: " + e);
    }
  };

  const handleBasicRegister = async () => {
    console.log(alias, pin, password, ip, fingerPrint);
    try {
      const res = await apiService.register({
        username: alias,
        password: pin,
        token: password,
        ip: ip,
        fingerPrint: fingerPrint,
      });
      if (res.result) {
        alert("註冊成功, uid: " + res.uuid);
        return;
      }
      alert("註冊失敗, e: " + res.message);
    } catch (e) {
      alert("註冊失敗, e: " + e);
    }
  };

  const handleAccountRegister = async () => {
    try {
      const res = await apiService.accountRegister({
        username: username,
        password: accountPassword,
        uuid: uuid || undefined, // 只在有值時傳入 UUID
      });
      if (res.result) {
        // 如果註冊成功，儲存返回的 UUID
        if (res.uuid && !uuid) {
          setUuid(res.uuid as string);
        }
        alert("帳號註冊成功, uid: " + res.uuid);
        return;
      }
      alert("帳號註冊失敗, e: " + res.message);
    } catch (e) {
      alert("帳號註冊失敗, e: " + e);
    }
  };

  const handleLogout = () => {
    user.setUid("");
    alert("登出成功");
  };

  const renderBasicAuthForm = () => (
    <>
      <div style={styles.inputGroup}>
        <label style={styles.label} htmlFor={`alias-${side}`}>
          別名
        </label>
        <input
          id={`alias-${side}`}
          style={styles.input}
          type="text"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
          placeholder="輸入別名"
        />
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label} htmlFor={`pin-${side}`}>
          PIN碼
        </label>
        <input
          id={`pin-${side}`}
          style={styles.input}
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="輸入PIN碼"
        />
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label} htmlFor={`password-${side}`}>
          密碼
        </label>
        <input
          id={`password-${side}`}
          style={styles.input}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="輸入密碼"
        />
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label} htmlFor={`ip-${side}`}>
          IP地址
        </label>
        <input
          id={`ip-${side}`}
          style={styles.input}
          type="text"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          placeholder="輸入IP地址"
        />
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label} htmlFor={`fingerPrint-${side}`}>
          指紋
        </label>
        <input
          id={`fingerPrint-${side}`}
          style={styles.input}
          type="text"
          value={fingerPrint}
          onChange={(e) => setFingerPrint(e.target.value)}
          placeholder="輸入指紋"
        />
      </div>

      <button
        style={{ ...styles.button, ...styles.submitButton }}
        onClick={handleBasicLogin}
      >
        登入
      </button>
      {user.uid === "" ? (
        <button
          style={{ ...styles.button, ...styles.logoutButton }}
          onClick={handleBasicRegister}
        >
          註冊
        </button>
      ) : (
        <button
          style={{ ...styles.button, ...styles.logoutButton }}
          onClick={handleLogout}
        >
          登出
        </button>
      )}
    </>
  );

  const renderAccountAuthForm = () => (
    <>
      <div style={styles.inputGroup}>
        <label style={styles.label} htmlFor={`username-${side}`}>
          帳號
        </label>
        <input
          id={`username-${side}`}
          style={styles.input}
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="輸入帳號"
        />
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label} htmlFor={`accountPassword-${side}`}>
          密碼
        </label>
        <input
          id={`accountPassword-${side}`}
          style={styles.input}
          type="password"
          value={accountPassword}
          onChange={(e) => setAccountPassword(e.target.value)}
          placeholder="輸入密碼"
        />
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label} htmlFor={`uuid-${side}`}>
          UUID
        </label>
        <input
          id={`uuid-${side}`}
          style={styles.input}
          type="text"
          value={uuid}
          onChange={(e) => setUuid(e.target.value)}
          placeholder="UUID"
        />
      </div>

      <button
        style={{ ...styles.button, ...styles.submitButton }}
        onClick={handleAccountLogin}
      >
        帳號登入
      </button>
      {user.uid === "" ? (
        <button
          style={{ ...styles.button, ...styles.logoutButton }}
          onClick={handleAccountRegister}
        >
          帳號註冊
        </button>
      ) : (
        <button
          style={{ ...styles.button, ...styles.logoutButton }}
          onClick={handleLogout}
        >
          登出
        </button>
      )}
    </>
  );

  return (
    <div style={styles.authHalf}>
      <div style={styles.titleContainer}>
        <h1 style={styles.title}>Microsoft OpenAI Demo</h1>
        <h2 style={styles.subtitle}>Lab408 AID Demo</h2>
      </div>

      <div style={styles.tabContainer}>
        <div
          style={{
            ...styles.tab,
            ...(authMode === "basic" ? styles.activeTab : styles.inactiveTab),
          }}
          onClick={() => setAuthMode("basic")}
        >
          基本登入
        </div>
        <div
          style={{
            ...styles.tab,
            ...(authMode === "account" ? styles.activeTab : styles.inactiveTab),
          }}
          onClick={() => setAuthMode("account")}
        >
          帳號登入
        </div>
      </div>

      <div style={styles.authForm}>
        {authMode === "basic" ? renderBasicAuthForm() : renderAccountAuthForm()}
      </div>
    </div>
  );
}
