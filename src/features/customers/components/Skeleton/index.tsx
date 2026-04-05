import styles from './Skeleton.module.scss';

export const SkeletonRows = () => (
  <>
    {Array.from({ length: 5 }).map((_, i) => (
      <tr key={i} className={styles.skeletonRow}>
        <td>
          <div className={styles.nameCell}>
            <div className={`${styles.skeleton} ${styles.avatarSkeleton}`} />
            <div className={`${styles.skeleton} ${styles.nameSkeleton}`} />
          </div>
        </td>
        <td>
          <div className={`${styles.skeleton} ${styles.emailSkeleton}`} />
        </td>
        <td>
          <div className={`${styles.skeleton} ${styles.phoneSkeleton}`} />
        </td>
        <td>
          <div className={`${styles.skeleton} ${styles.tagsSkeleton}`} />
        </td>
        <td />
      </tr>
    ))}
  </>
);
