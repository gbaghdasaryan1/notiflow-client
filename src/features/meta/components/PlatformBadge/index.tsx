import type { MetaPlatform } from '../../types';
import styles from './PlatformBadge.module.scss';

type Props = {
  platform: MetaPlatform;
  size?: 'sm' | 'md';
};

export const PlatformBadge = ({ platform, size = 'md' }: Props) => (
  <span className={`${styles.badge} ${styles[platform]} ${styles[size]}`}>
    {platform === 'facebook' ? 'Facebook' : 'Instagram'}
  </span>
);
