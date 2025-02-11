import { type Config } from '@measured/puck';
import { type Tables } from './database';
import { type ExtendedPuckData } from './puck';

// Define your component props types
interface HeadingProps {
  level: '1' | '2' | '3' | '4' | '5' | '6';
  text: string;
}

interface TextProps {
  content: string;
}

// Add more component prop types as needed

// Define your Puck configuration type
export type PuckConfig = Config<{
  components: {
    Heading: HeadingProps;
    Text: TextProps;
    // Add more components here
  };
  data: ExtendedPuckData & {
    id: Tables<'pages'>['Row']['id'];
    title: string;
    slug: string;
  };
}>;

// Export helper types
export type PuckComponent = PuckConfig['components'];
export type ComponentProps<T extends keyof PuckComponent> = PuckComponent[T];
