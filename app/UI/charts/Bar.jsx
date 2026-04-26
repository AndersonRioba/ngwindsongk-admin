import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { getDatesInRange, getDaySuffix } from '@/app/lib/dates';
  
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Bur() {
  let dates = getDatesInRange([2023,2,2], [2023,2,9]);
  let labels = dates.map((date)=>{
    date = date.split('-');
    return `${date[1].slice(0,3)} ${date[2]}${getDaySuffix(date[2])}`
  })
  
  let options = {
    maintainAspectRatio: false,
    scaleBeginAtZero: false,
    scales: {
      y: {
          min:0,
          grid:{
            display: true,
          }
      },
      x:{
        grid:{
          display: false,
        }
      },
    },
    plugins: {
      legend: {
        position: 'top',
        display: false,
      },
      title: {
        display: false,
        text: 'Total Revenue'
      },
    },
  };

  let data = {
    labels,
    datasets: [
      {
        data: Array.from({ length: labels.length }, () => Math.floor(Math.random() * 101)),
        backgroundColor: '#1083AC',
        borderColor: '#1083AC',
      },
    ],
  };

  return (
    <div className='md:h-[30vh] md:w-1/3 h-80'>
      <Bar options={options} data={data} />
    </div>
  );
}