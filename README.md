# CTS For Dimensity8100 v3.0

🚀 **专为天玑8100处理器优化的CPU调度模块**

[![Version](https://img.shields.io/badge/Version-v3.0-red.svg)]()

## 📖 项目简介

CTS (CPU Turbo Scheduler) For Dimensity8100 是一个专为联发科天玑8100处理器设计的高级CPU调度优化模块。该模块通过精细化的CPU频率调度、功耗管理和性能优化，为用户提供多种功耗模式选择，在性能与续航之间找到最佳平衡点。

### ✨ 主要特性

- 🎯 **专为天玑8100优化** - 针对联发科天玑8100处理器架构深度优化
- ⚡ **四种功耗模式** - 省电、平衡、性能、极速四种模式可选
- 🌐 **现代化WebUI** - 提供美观易用的Web管理界面
- ⚙️ **精细化配置** - 支持CPU调度器、IO调度器、核心分配等多项配置
- 📊 **实时监控** - 系统状态监控和日志管理功能
- 🔧 **智能调度** - EAS调度器优化，启动加速等智能功能

## 📋 系统要求

- **Android版本**: Android 8.0+ (API 26+)
- **处理器**: 联发科天玑8100系列
- **Root权限**: 需要Magisk，KernelSU或APatch

## ⚙️ 配置说明

### 功耗模式

模块提供四种预设的功耗模式：

| 模式 | 特点 | 适用场景 |
|------|------|----------|
| 🔋 **省电模式** | CPU频率限制，优化续航 | 轻度使用、待机保电 |
| ⚖️ **平衡模式** | 性能与功耗均衡 | 日常使用、推荐模式 |
| 🚀 **性能模式** | 提升性能表现 | 游戏、重度应用 |
| ⚡ **极速模式** | 最大性能输出 | 跑分、极限性能需求 |

### 核心配置参数

#### 功能开关
- **EAS调度器**: 启用能耗感知调度
- **启动加速**: 应用启动时的临时性能提升
- **CPU集合**: CPU核心分组管理
- **IO调度器**: 存储IO性能优化

#### 核心分配
- **小核路径**: 效率核心（CPU 0-3）
- **中核路径**: 中等性能核心（CPU 4-6）  
- **大核路径**: 高性能核心（CPU 7）

#### 调度参数
- **使用率控制**: 前台/后台应用CPU使用率限制
- **频率控制**: 各核心最大频率限制
- **延迟敏感**: 低延迟应用优化

## 🌐 WebUI使用

模块提供了现代化的Web管理界面，支持以下功能：

### 主要页面

1. **状态页面** - 查看模块运行状态和当前配置
2. **配置页面** - 修改各项调度参数和功耗模式
3. **日志页面** - 查看系统运行日志和调试信息
4. **设置页面** - 应用主题设置和模块信息

### 访问方式

- 通过KernelSU的WebUI功能访问
- 支持深色/浅色主题切换
- 响应式设计，支持手机和平板设备

## 📊 配置文件说明

### config.ini 完整配置说明

#### [meta] - 模块元信息
```ini
[meta]
name = "天玑8100"           # 芯片名称标识
author = Aus_tin & MoWei    # 配置开发者
configVersion = 14          # 配置文件版本号
loglevel = "INFO"           # 日志输出级别（DEBUG/INFO/WARN/ERROR）
```

#### [function] - 功能开关配置
```ini
[function]
DisableQcomGpu = false      # 禁用高通GPU优化（天玑芯片设为false）
AffintySetter = true        # 启用CPU亲和性设置
CpuIdleScaling_Governor = true  # CPU空闲调频调节器
EasScheduler = true         # 启用EAS（Energy Aware Scheduler）调度器
cpuset = true              # 启用CPU集合管理
LoadBalancing = true        # 启用负载均衡
EnableFeas = false         # 启用FEAS调度器（实验性功能）
AdjIOScheduler = true      # 调整IO调度器
LaunchBoost = false        # 应用启动加速
```

#### [LaunchBoost] - 启动加速配置
```ini
[LaunchBoost]
BoostRateMs = 500          # 加速持续时间（毫秒）
FreqMulti = 1.5            # 频率倍数
```

#### [CoreAllocation] - 核心分配配置
```ini
[CoreAllocation]
cpusetCore = "4-7"         # 分配给重要任务的CPU核心
cpuctlUclampBoostMin = "10" # CPU使用率下限提升值
cpuctlUclampBoostMax = "95" # CPU使用率上限提升值
```

#### [CoreFramework] - 核心架构配置
```ini
[CoreFramework]
SmallCorePath = 0          # 小核（效率核）起始编号
MediumCorePath = 4         # 中核起始编号
BigCorePath = 7            # 大核（性能核）起始编号
```

#### [IO_Settings] - IO调度设置
```ini
[IO_Settings]
Scheduler = "mq-deadline"   # IO调度器类型
IO_optimization = true     # 启用IO优化
```

#### [Other] - 其他设置
```ini
[Other]
AdjQcomBus_dcvs = false    # 调整高通总线动态时钟电压调节
```

#### [EasSchedulerVaule] - EAS调度器参数
```ini
[EasSchedulerVaule]
sched_min_granularity_ns = "2000000"     # 最小调度粒度（纳秒）
sched_nr_migrate = "18"                  # 进程迁移数量限制
sched_wakeup_granularity_ns = "3000000"  # 唤醒粒度（纳秒）
sched_schedstats = "0"                   # 调度统计（0=关闭，1=开启）
```

#### [ParamSchedPath] - 调度参数路径配置
```ini
[ParamSchedPath]
ParamSchedPath1 = "down_rate_limit_us"   # 降频速率限制参数路径
ParamSchedPath2 = "up_rate_limit_us"     # 升频速率限制参数路径
ParamSchedPath3 = ""                     # 预留参数路径3
ParamSchedPath4 = ""                     # 预留参数路径4
# ... ParamSchedPath5-12 为预留参数路径
```

#### [CpuIdle] - CPU空闲管理
```ini
[CpuIdle]
current_governor = "menu"   # CPU空闲调节器类型
```

#### [Cpuset] - CPU集合分配
```ini
[Cpuset]
top_app = "0-7"            # 前台应用可用CPU核心
foreground = "0-6"         # 前台进程可用CPU核心
restricted = "0-5"         # 受限进程可用CPU核心
system_background = "1-2"  # 系统后台进程可用CPU核心
background = "0-2"         # 后台进程可用CPU核心
```

#### [powersave] - 省电模式配置
```ini
[powersave]
scaling_governor = "schedutil"    # CPU调频调节器
UclampTopAppMin = "0"            # 前台应用CPU使用率下限
UclampTopAppMax = "80"           # 前台应用CPU使用率上限
UclampTopApplatency_sensitive = "0"  # 前台应用延迟敏感度
UclampForeGroundMin = "0"        # 前台进程CPU使用率下限
UclampForeGroundMax = "60"       # 前台进程CPU使用率上限
UclampBackGroundMin = "0"        # 后台进程CPU使用率下限
UclampBackGroundMax = "30"       # 后台进程CPU使用率上限
SmallCoreMaxFreq = 1400000       # 小核最大频率（Hz）
MediumCoreMaxFreq = 1600000      # 中核最大频率（Hz）
BigCoreMaxFreq = 1600000         # 大核最大频率（Hz）
ufsClkGate = true                # UFS时钟门控
ParamSched1 = 0                  # 调度参数1（降频速率）
ParamSched2 = 2500               # 调度参数2（升频速率）
```

#### [balance] - 平衡模式配置
```ini
[balance]
scaling_governor = "schedutil"    # CPU调频调节器
UclampTopAppMin = "0"            # 前台应用CPU使用率下限
UclampTopAppMax = "85"           # 前台应用CPU使用率上限
UclampTopApplatency_sensitive = "0"  # 前台应用延迟敏感度
UclampForeGroundMin = "0"        # 前台进程CPU使用率下限
UclampForeGroundMax = "60"       # 前台进程CPU使用率上限
UclampBackGroundMin = "0"        # 后台进程CPU使用率下限
UclampBackGroundMax = "30"       # 后台进程CPU使用率上限
SmallCoreMaxFreq = 1800000       # 小核最大频率（Hz）
MediumCoreMaxFreq = 2050000      # 中核最大频率（Hz）
BigCoreMaxFreq = 2000000         # 大核最大频率（Hz）
ufsClkGate = true                # UFS时钟门控
ParamSched1 = 0                  # 调度参数1（降频速率）
ParamSched2 = 1500               # 调度参数2（升频速率）
```

#### [performance] - 性能模式配置
```ini
[performance]
scaling_governor = "schedutil"    # CPU调频调节器
UclampTopAppMin = "10"           # 前台应用CPU使用率下限
UclampTopAppMax = "80"           # 前台应用CPU使用率上限
UclampTopApplatency_sensitive = "1"  # 前台应用延迟敏感度（启用）
UclampForeGroundMin = "0"        # 前台进程CPU使用率下限
UclampForeGroundMax = "70"       # 前台进程CPU使用率上限
UclampBackGroundMin = "0"        # 后台进程CPU使用率下限
UclampBackGroundMax = "35"       # 后台进程CPU使用率上限
SmallCoreMaxFreq = 2000000       # 小核最大频率（Hz）
MediumCoreMaxFreq = 2400000      # 中核最大频率（Hz）
BigCoreMaxFreq = 2500000         # 大核最大频率（Hz）
ufsClkGate = false               # 关闭UFS时钟门控以提升性能
ParamSched1 = 0                  # 调度参数1（降频速率）
ParamSched2 = 1000               # 调度参数2（升频速率）
```

#### [fast] - 极速模式配置
```ini
[fast]
scaling_governor = "performance" # 性能调频调节器
UclampTopAppMin = "20"           # 前台应用CPU使用率下限
UclampTopAppMax = "100"          # 前台应用CPU使用率上限（最大）
UclampTopApplatency_sensitive = "1"  # 前台应用延迟敏感度（启用）
UclampForeGroundMin = "10"       # 前台进程CPU使用率下限
UclampForeGroundMax = "80"       # 前台进程CPU使用率上限
UclampBackGroundMin = "0"        # 后台进程CPU使用率下限
UclampBackGroundMax = "40"       # 后台进程CPU使用率上限
SmallCoreMaxFreq = 2000000       # 小核最大频率（Hz）
MediumCoreMaxFreq = 2850000      # 中核最大频率（Hz）
BigCoreMaxFreq = 2850000         # 大核最大频率（Hz）
ufsClkGate = false               # 关闭UFS时钟门控
ParamSched1 = 0                  # 调度参数1（降频速率）
ParamSched2 = 800                # 调度参数2（升频速率，最快）
```

### 配置参数详解

#### 频率单位说明
- CPU频率单位为Hz（赫兹）
- 1MHz = 1,000,000Hz
- 例：2000000 = 2.0GHz

#### 使用率控制说明
- Uclamp参数控制CPU使用率范围（0-100）
- Min值：最低保证的CPU性能
- Max值：最高允许的CPU性能
- 延迟敏感：1=启用低延迟优化，0=关闭

#### 调度器类型说明
- **schedutil**：智能调频，平衡性能与功耗
- **performance**：性能优先，维持最高频率
- **powersave**：省电优先，维持最低频率
- **ondemand**：按需调频（传统方式）

#### IO调度器说明
- **mq-deadline**：多队列截止时间调度器，适合SSD
- **cfq**：完全公平队列调度器
- **noop**：无操作调度器，适合高速存储

### 路径说明

- **配置文件**: `/sdcard/Android/MW_CpuSpeedController/config.ini`
- **模式文件**: `/sdcard/Android/MW_CpuSpeedController/config.txt`
- **日志文件**: `/sdcard/Android/MW_CpuSpeedController/log.txt`
- **模块目录**: `/data/adb/modules/MW_CpuTurboScheduler/`

## 🐛 故障排除

### 常见问题

**Q: 模块安装后无效果？**
A: 检查设备是否为天玑8100，确认Root权限正常，查看日志文件排除错误。

**Q: WebUI无法访问？**
A: 确认KernelSU版本支持WebUI功能，检查模块是否正确安装。

**Q: 性能模式切换失败？**
A: 检查配置文件权限，确认 `/sdcard/Android/MW_CpuSpeedController/` 目录可写。

**Q: 某些应用卡顿？**
A: 尝试切换到性能模式，或调整前台应用使用率限制。

### WebUI开发

- **CoolApk@机型质检员** - 前端开发
- **CoolApk@瓦力喀** - UI设计与优化

## 📞 联系方式

- **GitHub**: [原项目地址](https://github.com/MoWei-2077/MW_CpuTurboScheduler)
- **调度及模块开发者**: MoWei & Aus_tin
- **反馈**: 通过GitHub Issues提交问题和建议

---

<div align="center">
  <strong>让你的天玑8100发挥最佳性能！</strong><br>
  <sub>Built with ❤️ for Android enthusiasts</sub>
</div>