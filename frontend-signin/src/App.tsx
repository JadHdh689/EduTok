// src/App.tsx
import React, { useMemo, useState } from "react";
import {
  AppBar, Toolbar, Typography, Container, Tabs, Tab,
  Box, TextField, Button, Stack, Paper, Divider, Chip, Alert, LinearProgress
} from "@mui/material";
import { AuthAPI} from "./api";
import type {Tokens } from "./api";

type TabKey = "signup" | "confirm" | "signin" | "forgot" | "reset" | "change" | "me";

export default function App() {
  const [tab, setTab] = useState<TabKey>("signup");
  const [loading, setLoading] = useState(false);
  const [out, setOut] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const tokens = AuthAPI.getStoredTokens();

  const handle = async (fn: () => Promise<any>) => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fn();
      setOut(res?.data ?? res);
    } catch (e: any) {
      const m = e?.response?.data?.message ?? e?.message ?? "Request failed";
      setErr(Array.isArray(m) ? m.join(", ") : String(m));
      setOut(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography sx={{ flex: 1 }} variant="h6">Auth Playground (Nest + Cognito)</Typography>
          {tokens ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Signed in
              </Typography>
              <Button variant="outlined" size="small" onClick={() => handle(AuthAPI.signOut)}>
                Sign out
              </Button>
            </Stack>
          ) : (
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Not signed in
            </Typography>
          )}
        </Toolbar>
      </AppBar>

      {loading && <LinearProgress />}

      <Container sx={{ mt: 3, mb: 5 }}>
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab value="signup" label="Sign Up" />
            <Tab value="confirm" label="Confirm" />
            <Tab value="signin" label="Sign In" />
            <Tab value="forgot" label="Forgot" />
            <Tab value="reset" label="Reset" />
            <Tab value="change" label="Change Password" />
            <Tab value="me" label="/users/me" />
          </Tabs>

          <Divider sx={{ my: 2 }}>
            <Chip label={tab.toUpperCase()} />
          </Divider>

          <Box sx={{ mt: 1 }}>
            {tab === "signup" && <SignUp onRun={handle} />}
            {tab === "confirm" && <Confirm onRun={handle} />}
            {tab === "signin" && <SignIn onRun={handle} />}
            {tab === "forgot" && <Forgot onRun={handle} />}
            {tab === "reset" && <Reset onRun={handle} />}
            {tab === "change" && <ChangePassword onRun={handle} />}
            {tab === "me" && <GetMe onRun={handle} />}
          </Box>
        </Paper>

        <Stack spacing={2}>
          {err && <Alert severity="error">{err}</Alert>}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Last Response</Typography>
            <pre style={{ margin: 0, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
              {out ? JSON.stringify(out, null, 2) : "—"}
            </pre>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Stored Tokens</Typography>
            <TokenView tokens={tokens ?? undefined} />
          </Paper>
        </Stack>
      </Container>
    </>
  );
}

function TokenView({ tokens }: { tokens?: Tokens }) {
  if (!tokens) return <Typography variant="body2">—</Typography>;
  const compact: Record<string, any> = {
    accessToken: tokens.accessToken?.slice(0, 20) + "...",
    idToken: tokens.idToken ? tokens.idToken.slice(0, 20) + "..." : undefined,
    refreshToken: tokens.refreshToken ? tokens.refreshToken.slice(0, 20) + "..." : undefined,
    expiresIn: tokens.expiresIn,
    tokenType: tokens.tokenType,
  };
  return (
    <pre style={{ margin: 0, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
      {JSON.stringify(compact, null, 2)}
    </pre>
  );
}

/* ------- Forms ------- */

function SignUp({ onRun }: { onRun: (fn: () => Promise<any>) => void }) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <Stack spacing={2}>
      <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <TextField label="Username (optional)" value={username} onChange={(e) => setUsername(e.target.value)} />
      <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <Button variant="contained" onClick={() => onRun(() => AuthAPI.signUp(email, password, username || undefined))}>
        Sign Up
      </Button>
    </Stack>
  );
}

function Confirm({ onRun }: { onRun: (fn: () => Promise<any>) => void }) {
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");

  return (
    <Stack spacing={2}>
      <TextField label="Username (or email used)" value={username} onChange={(e) => setUsername(e.target.value)} />
      <TextField label="Code" value={code} onChange={(e) => setCode(e.target.value)} />
      <Stack direction="row" spacing={1}>
        <Button variant="contained" onClick={() => onRun(() => AuthAPI.confirm(username, code))}>
          Confirm
        </Button>
        <Button variant="outlined" onClick={() => onRun(() => AuthAPI.resend(username))}>
          Resend Code
        </Button>
      </Stack>
    </Stack>
  );
}

function SignIn({ onRun }: { onRun: (fn: () => Promise<any>) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <Stack spacing={2}>
      <TextField label="Username (or email)" value={username} onChange={(e) => setUsername(e.target.value)} />
      <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <Button variant="contained" onClick={() => onRun(() => AuthAPI.signIn(username, password))}>
        Sign In
      </Button>
    </Stack>
  );
}

function Forgot({ onRun }: { onRun: (fn: () => Promise<any>) => void }) {
  const [username, setUsername] = useState("");

  return (
    <Stack spacing={2}>
      <TextField label="Username (or email)" value={username} onChange={(e) => setUsername(e.target.value)} />
      <Button variant="contained" onClick={() => onRun(() => AuthAPI.forgot(username))}>
        Send Reset Code
      </Button>
    </Stack>
  );
}

function Reset({ onRun }: { onRun: (fn: () => Promise<any>) => void }) {
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  return (
    <Stack spacing={2}>
      <TextField label="Username (or email)" value={username} onChange={(e) => setUsername(e.target.value)} />
      <TextField label="Code" value={code} onChange={(e) => setCode(e.target.value)} />
      <TextField label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
      <Button variant="contained" onClick={() => onRun(() => AuthAPI.reset(username, code, newPassword))}>
        Reset Password
      </Button>
    </Stack>
  );
}

function ChangePassword({ onRun }: { onRun: (fn: () => Promise<any>) => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  return (
    <Stack spacing={2}>
      <TextField label="Current Password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
      <TextField label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
      <Button variant="contained" onClick={() => onRun(() => AuthAPI.changePassword(currentPassword, newPassword))}>
        Change Password
      </Button>
    </Stack>
  );
}

function GetMe({ onRun }: { onRun: (fn: () => Promise<any>) => void }) {
  return (
    <Stack spacing={2}>
      <Typography variant="body2">
        Calls <code>/users/me</code> with your current <code>accessToken</code>. Your backend will upsert/read the local user row.
      </Typography>
      <Button variant="contained" onClick={() => onRun(AuthAPI.getMe)}>
        GET /users/me
      </Button>
    </Stack>
  );
}
