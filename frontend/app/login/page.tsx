import { login, signup } from './actions'

export default function LoginPage() {
  return (
    <form>
      <label htmlFor="email">Eメール:</label>
      <input id="email" name="email" type="email" required />
      <label htmlFor="password">パスワード:</label>
      <input id="password" name="password" type="password" required />
      <button formAction={login}>ログイン</button>
      <button formAction={signup}>アカウント作成</button>
    </form>
  )
}