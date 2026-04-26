import {
  Chart as ChartJS,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import {  Pie } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);

export const options = {
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      display: false,
    },
    title: {
      display: false,
      text: '% Performance',
    },
  },
};

  
export default function Py() {

  let data = {
    labels: ['one', 'two'],
    datasets: [
      {
        data: [76,24],
        backgroundColor: ['#1083AC','rgba(198, 65, 48, 0.2)'],
        borderColor: ['#1083AC','rgba(198, 65, 48, 0.2)'],
      },
    ],
  };

  return (
    <Pie data={data} options={options} />
  );
}