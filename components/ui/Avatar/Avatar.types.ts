export interface AvatarProps {
  name: string;
  src?: string | null;
  size?: number;
}

export interface AvatarStackProps {
  users: { name: string; image?: string | null }[];
  max?: number;
  size?: number;
}
