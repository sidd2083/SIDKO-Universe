import { motion } from 'framer-motion';

export const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export const pageTransition = {
  duration: 0.25,
  ease: [0.25, 0.1, 0.25, 1],
};

export function PageWrapper({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
}