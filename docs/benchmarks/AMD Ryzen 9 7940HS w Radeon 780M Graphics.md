## Benchmark Report
> - CPU: AMD Ryzen 9 7940HS w/ Radeon 780M Graphics     
> - RAM: 31 GB
> - NodeJS Version: v20.10.0
> - Backend Server: 1 core / 1 thread
> - Arguments: 
>   - Count: 1,024
>   - Threads: 4
>   - Simultaneous: 32
> - Total Elapsed Time: 501 ms

### Total
Type | Count | Success | Mean. | Stdev. | Minimum | Maximum
----|----|----|----|----|----|----
Total | 1,052 | 1,052 | 14.08 | 7.8 | 3 | 74

### Endpoints
Type | Count | Success | Mean. | Stdev. | Minimum | Maximum
----|----|----|----|----|----|----
GET /monitors/system | 563 | 563 | 14.12 | 7.78 | 3 | 71
GET /monitors/health | 489 | 489 | 14.04 | 7.83 | 4 | 74

### Failures
Method | Path | Count | Success
-------|------|-------|--------