import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

function PieChart({ gmailStorage, driveStorage }) {
  const data = {
    labels: ["Gmail", "Drive"],
    datasets: [
      {
        data: [gmailStorage, driveStorage],
        backgroundColor: [
          "#4285F4",
          "#34A853",
        ],
      },
    ],
  };

  return <Pie data={data} />;
}

export default PieChart;