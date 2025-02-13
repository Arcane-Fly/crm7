import { type Config } from '@measured/puck';
import * as React from 'react';
import styles from './components.module.css';

interface ComponentProps {
  title?: string;
  description?: string;
  backgroundColor?: string;
  textColor?: string;
}

export const components: Config['components'] = {
  Hero: {
    fields: {
      title: { type: 'text' },
      description: { type: 'text' },
      backgroundColor: { type: 'text' },
      textColor: { type: 'text' },
    },
    defaultProps: {
      title: 'Welcome',
      description: 'This is a hero section',
      backgroundColor: '#ffffff',
      textColor: '#000000',
    },
    render: ({ title, description, backgroundColor, textColor }: ComponentProps) => {
      const HeroComponent: React.FC<ComponentProps> = () => {
        React.useEffect(() => {
          if (backgroundColor) {
            document.documentElement.style.setProperty('--hero-background-color', backgroundColor);
          }
          if (textColor) {
            document.documentElement.style.setProperty('--hero-text-color', textColor);
          }
        }, []);

        return (
          <div className={styles.heroContainer}>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
        );
      };

      return <HeroComponent />;
    },
  },
};
