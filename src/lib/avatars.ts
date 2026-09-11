const AVATAR_COLORS = [
  'bg-purple-500/15 text-purple-500',
  'bg-sky-500/15 text-sky-500',
  'bg-emerald-500/15 text-emerald-500',
  'bg-rose-500/15 text-rose-500',
  'bg-amber-500/15 text-amber-500',
  'bg-indigo-500/15 text-indigo-500',
];

export const initials = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');

export const avatarColor = (name: string) => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
};