import AuthForm from '@/components/AuthForm';
import { LoginClientWrapper } from './components/LoginClientWrapper';
import LoginContent from './components/LoginContent';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function LoginPage(props: Props) {
  const searchParams = await props.searchParams;
  const message = typeof searchParams.message === 'string' ? searchParams.message : null;
  const mode = searchParams.mode === 'signup' ? 'signup' : 'signin';
  const isLogin = mode === 'signin';

  return (
    <LoginClientWrapper>
      <LoginContent isLogin={isLogin} message={message} />
    </LoginClientWrapper>
  );
}