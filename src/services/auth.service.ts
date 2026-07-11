import { User, IUser } from '@models/User.model';
import { AppError } from '@utils/AppError';
import { signAccessToken, signRefreshToken } from '@utils/jwt';
import type { RegisterInput, LoginInput } from '@validators/auth.validator';

interface AuthResult {
  user: Pick<IUser, '_id' | 'name' | 'email'>;
  accessToken: string;
  refreshToken: string;
}

export async function registerUser(input: RegisterInput): Promise<AuthResult> {
  const existing = await User.findOne({ email: input.email });
  if (existing) {
    throw new AppError('An account with this email already exists', 409);
  }

  const user = await User.create(input);

  const payload = { userId: user._id.toString() };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  return {
    user: { _id: user._id, name: user.name, email: user.email },
    accessToken,
    refreshToken,
  };
}

export async function loginUser(input: LoginInput): Promise<AuthResult> {
  const user = await User.findOne({ email: input.email }).select('+password');
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isMatch = await user.comparePassword(input.password);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  const payload = { userId: user._id.toString() };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  return {
    user: { _id: user._id, name: user.name, email: user.email },
    accessToken,
    refreshToken,
  };
}

export async function getUserById(userId: string): Promise<IUser | null> {
  return User.findById(userId);
}