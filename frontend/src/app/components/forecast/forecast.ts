import { Component, OnInit, AfterViewInit, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ForecastService } from '../../services/forecast';
import { SidebarComponent } from '../../shared/sidebar';

@Component({
  selector: 'app-forecast',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule, SidebarComponent],
  styles: [`
    .app-layout { display:flex; min-height:100vh; background:#0f172a; color:#e2e8f0; font-family:'Segoe UI',sans-serif; }
    .main-content { margin-left:240px; flex:1; padding:32px; min-height:100vh; }
    .page-header { margin-bottom:28px; }
    .page-header h2 { font-size:24px; font-weight:700; color:#f1f5f9; margin:0 0 4px; }
    .page-header p { font-size:14px; color:#64748b; margin:0; }
    .stat-card { background:#1e293b; border:1px solid #334155; border-radius:12px; padding:20px; }
    .label { font-size:12px; color:#64748b; text-transform:uppercase; letter-spacing:.5px; margin-bottom:8px; font-weight:600; }
    .value { font-size:32px; font-weight:700; }
    .section-header { margin-bottom:16px; }
    .section-header h3 { font-size:16px; font-weight:600; color:#f1f5f9; margin:0; }
    .forecast-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:16px; }
    .forecast-card { background:#1e293b; border:1px solid #334155; border-radius:12px; padding:20px; }
    .forecast-card h4 { font-size:15px; font-weight:600; color:#f1f5f9; margin:0 0 4px; }
    .forecast-card .cat { font-size:12px; color:#64748b; margin-bottom:12px; }
    .forecast-card .row { display:flex; justify-content:space-between; padding:7px 0; border-bottom:1px solid #1e293b; font-size:13px; color:#94a3b8; }
    .forecast-card .row:last-child { border-bottom:none; }
    .forecast-card .row span:last-child { color:#e2e8f0; font-weight:500; }
    .badge { display:inline-block; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600; text-transform:uppercase; }
    .badge-high { background:#ef444420; color:#ef4444; border:1px solid #ef444440; }
    .badge-medium { background:#f9731620; color:#f97316; border:1px solid #f9731640; }
    .badge-green { background:#22c55e20; color:#22c55e; border:1px solid #22c55e40; }
    .loading-state { text-align:center; padding:60px 20px; color:#475569; display:flex; flex-direction:column; align-items:center; gap:12px; }
    .spinner { width:32px; height:32px; border:3px solid #334155; border-top-color:#4f8ef7; border-radius:50%; animation:spin .8s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } }
  `],
  template: `
    <div class="app-layout">
      <app-sidebar></app-sidebar>
      <main class="main-content">
        <div class="page-header">
          <h2>Demand Forecast</h2>
          <p>AI-powered inventory risk analysis and reorder recommendations</p>
        </div>

        <div class="loading-state" *ngIf="loading">
          <div class="spinner"></div><p>Loading forecast data...</p>
        </div>

        <ng-container *ngIf="!loading && forecasts.length > 0">
          <!-- PIE CHART + STAT CARDS -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:28px">
            <div class="stat-card" style="display:flex;flex-direction:column;align-items:center">
              <div class="label" style="margin-bottom:16px;align-self:flex-start">Risk Distribution</div>
              <canvas #pieChart width="220" height="220"></canvas>
              <div style="display:flex;gap:20px;margin-top:16px;font-size:13px">
                <span style="display:flex;align-items:center;gap:6px">
                  <span style="width:12px;height:12px;border-radius:50%;background:#ef4444;display:inline-block"></span>
                  High ({{ highCount }})
                </span>
                <span style="display:flex;align-items:center;gap:6px">
                  <span style="width:12px;height:12px;border-radius:50%;background:#f97316;display:inline-block"></span>
                  Medium ({{ medCount }})
                </span>
                <span style="display:flex;align-items:center;gap:6px">
                  <span style="width:12px;height:12px;border-radius:50%;background:#22c55e;display:inline-block"></span>
                  Low ({{ lowCount }})
                </span>
              </div>
            </div>
            <div style="display:grid;grid-template-rows:repeat(3,1fr);gap:16px">
              <div class="stat-card">
                <div class="label">High Risk</div>
                <div class="value" style="color:#ef4444">{{ highCount }}</div>
              </div>
              <div class="stat-card">
                <div class="label">Medium Risk</div>
                <div class="value" style="color:#f97316">{{ medCount }}</div>
              </div>
              <div class="stat-card">
                <div class="label">Low Risk</div>
                <div class="value" style="color:#22c55e">{{ lowCount }}</div>
              </div>
            </div>
          </div>

          <!-- FORECAST CARDS -->
          <div class="section-header"><h3>Product Forecasts</h3></div>
          <div class="forecast-grid">
            <div class="forecast-card" *ngFor="let f of forecasts"
              [style.border-left]="'3px solid ' + getRiskColor(f.riskLevel)">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
                <div>
                  <h4>{{ f.productName }}</h4>
                  <div class="cat">{{ f.category }}</div>
                </div>
                <span [class]="getRiskClass(f.riskLevel)">{{ f.riskLevel }}</span>
              </div>
              <div class="row"><span>Current Stock</span><span>{{ f.currentStock }}</span></div>
              <div class="row"><span>Predicted Demand</span><span>{{ f.predictedDemand | number:'1.0-0' }}</span></div>
              <div class="row">
                <span>Days Until Stockout</span>
                <span [style.color]="f.daysUntilStockout < 7 ? '#ef4444' : '#e2e8f0'">
                  {{ f.daysUntilStockout | number:'1.0-0' }} days
                </span>
              </div>
              <div class="row">
                <span>Recommended Reorder</span>
                <span style="color:#4f8ef7;font-weight:700">{{ f.recommendedReorderQuantity | number:'1.0-0' }} units</span>
              </div>
            </div>
          </div>
        </ng-container>

        <div *ngIf="!loading && forecasts.length === 0"
          style="text-align:center;padding:64px;color:#94a3b8">
          <mat-icon style="font-size:48px;width:48px;height:48px;margin-bottom:16px;display:block;margin-left:auto;margin-right:auto">trending_up</mat-icon>
          <p>No forecast data available. Add products and stock transactions first!</p>
        </div>
      </main>
    </div>
  `
})
export class Forecast implements OnInit, AfterViewInit {
  @ViewChild('pieChart') pieChartRef!: ElementRef<HTMLCanvasElement>;
  forecasts: any[] = [];
  highCount = 0; medCount = 0; lowCount = 0;
  loading = false;
  chartDrawn = false;

  constructor(
    private forecastService: ForecastService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loading = true;
    this.forecastService.forecastAllProducts().subscribe({
      next: (data) => {
        this.forecasts = data;
        this.highCount = data.filter((f: any) => f.riskLevel === 'HIGH').length;
        this.medCount = data.filter((f: any) => f.riskLevel === 'MEDIUM').length;
        this.lowCount = data.filter((f: any) => f.riskLevel === 'LOW').length;
        this.loading = false;
        this.cdr.detectChanges();
        setTimeout(() => this.drawPieChart(), 100);
      },
      error: () => { this.forecasts = []; this.loading = false; this.cdr.detectChanges(); }
    });
  }

  ngAfterViewInit() {
    if (this.forecasts.length > 0) setTimeout(() => this.drawPieChart(), 100);
  }

  drawPieChart() {
    if (!this.pieChartRef || this.chartDrawn) return;
    const canvas = this.pieChartRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const total = this.highCount + this.medCount + this.lowCount;
    if (total === 0) return;
    this.chartDrawn = true;
    const data = [
      { value: this.highCount, color: '#ef4444' },
      { value: this.medCount, color: '#f97316' },
      { value: this.lowCount, color: '#22c55e' }
    ];
    const cx = 110, cy = 110, r = 90;
    let start = -Math.PI / 2;
    ctx.clearRect(0, 0, 220, 220);
    data.forEach(d => {
      if (d.value === 0) return;
      const slice = (d.value / total) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, start + slice);
      ctx.closePath();
      ctx.fillStyle = d.color;
      ctx.fill();
      ctx.strokeStyle = '#0a1628';
      ctx.lineWidth = 2;
      ctx.stroke();
      start += slice;
    });
    ctx.beginPath();
    ctx.arc(cx, cy, 45, 0, 2 * Math.PI);
    ctx.fillStyle = '#112240';
    ctx.fill();
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 18px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(total), cx, cy);
  }

  getRiskColor(risk: string) { return risk === 'HIGH' ? '#ef4444' : risk === 'MEDIUM' ? '#f97316' : '#22c55e'; }
  getRiskClass(risk: string) { return risk === 'HIGH' ? 'badge badge-high' : risk === 'MEDIUM' ? 'badge badge-medium' : 'badge badge-green'; }
}
