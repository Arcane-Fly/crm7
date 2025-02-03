import { Chart } from 'react-chartjs-2';

export function FundingChart(): React.ReactElement {
  const options = {
    scales: {
      y: {
        ticks: {
          callback: (value: number): string => {
            return `$${Number(value).toLocaleString()}`;
          }
        }
      }
    }
  };

  // Rest of component implementation...
}
