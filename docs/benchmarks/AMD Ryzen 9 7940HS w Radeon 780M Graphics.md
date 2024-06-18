## Benchmark Report
> - CPU: AMD Ryzen 9 7940HS w/ Radeon 780M Graphics     
> - RAM: 31 GB
> - NodeJS Version: v20.10.0
> - Backend Server: 1 core / 1 thread
> - Arguments: 
>   - Count: 1,024
>   - Threads: 4
>   - Simultaneous: 32
> - Total Elapsed Time: 526 ms

### Total
Type | Count | Success | Mean. | Stdev. | Minimum | Maximum
----|----|----|----|----|----|----
Total | 1,052 | 1,052 | 15.02 | 6.82 | 8 | 58

### Endpoints
Type | Count | Success | Mean. | Stdev. | Minimum | Maximum
----|----|----|----|----|----|----
GET /monitors/health | 517 | 517 | 15.24 | 7.26 | 8 | 58
GET /monitors/system | 535 | 535 | 14.81 | 6.37 | 9 | 58

### Failures
Method | Path | Count | Success
-------|------|-------|--------