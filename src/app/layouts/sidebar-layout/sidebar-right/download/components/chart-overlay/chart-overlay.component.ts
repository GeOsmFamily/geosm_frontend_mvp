import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { faFileDownload, faTimes } from '@fortawesome/free-solid-svg-icons';
import {
  Chart,
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  BarController,
  BubbleController,
  DoughnutController,
  LineController,
  PieController,
  PolarAreaController,
  RadarController,
  ScatterController,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  RadialLinearScale,
  TimeScale,
  TimeSeriesScale,
  Decimation,
  Filler,
  Legend,
  Title,
  Tooltip
} from 'chart.js';

@Component({
  selector: 'app-chart-overlay',
  templateUrl: './chart-overlay.component.html',
  styleUrls: ['./chart-overlay.component.scss']
})
export class ChartOverlayComponent implements OnInit {
  @Input() chartConnfiguration: any;

  @Input() idChart: any;

  close: EventEmitter<any> = new EventEmitter();

  listFiles: EventEmitter<any> = new EventEmitter();

  myChart: any | undefined;

  faClose = faTimes;
  faDownload = faFileDownload;

  constructor() {
    Chart.register(
      ArcElement,
      LineElement,
      BarElement,
      PointElement,
      BarController,
      BubbleController,
      DoughnutController,
      LineController,
      PieController,
      PolarAreaController,
      RadarController,
      ScatterController,
      CategoryScale,
      LinearScale,
      LogarithmicScale,
      RadialLinearScale,
      TimeScale,
      TimeSeriesScale,
      Decimation,
      Filler,
      Legend,
      Title,
      Tooltip
    );
  }

  ngOnInit(): void {
    if (this.idChart && this.chartConnfiguration) {
      this.initialiseChart();
    }
  }

  initialiseChart() {
    // @ts-ignore
    const ctx = document.getElementById('myChart')!.getContext('2d');
    console.log(ctx);
    this.myChart = new Chart(ctx, this.chartConnfiguration);
    setTimeout(() => {
      //@ts-ignore
      document.getElementById('chart-export-download-img')!['href'] = this.myChart.toBase64Image();
    }, 1500);
  }

  closeChart() {
    this.close.emit(this.idChart);
  }

  listFilesToDownload() {
    this.listFiles.emit(this.idChart);
  }
}
