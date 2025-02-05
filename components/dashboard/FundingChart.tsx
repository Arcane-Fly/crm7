export function FundingChart(): React.ReactElement {
  const [data, setData] = useState<FundingData[]>([]);
  const _options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Funding Overview',
      },
    },
  };

  // Rest of component implementation...
}
