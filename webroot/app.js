// Application state
const AppState = {
    currentPage: 'status',
    theme: 'auto',
    isConnected: false,
    moduleData: null,
    configData: null,
    originalConfigData: null,
    logData: null,
    isConfigModified: false,
    currentMode: 'balance', // powersave, balance, performance, fast
    currentLogLevel: 'INFO' // DEBUG, INFO, WARNING, ERROR
};

// KernelSU API functions (with fallback)
let exec, toast, moduleInfo;

// Initialize API functions
function initializeAPI() {
    if (typeof window.ksu !== 'undefined') {
        // KernelSU is available
        exec = async (command, options = {}) => {
            return new Promise((resolve, reject) => {
                const callbackName = `exec_callback_${Date.now()}`;
                window[callbackName] = (errno, stdout, stderr) => {
                    resolve({ errno, stdout, stderr });
                    delete window[callbackName];
                };
                try {
                    window.ksu.exec(command, JSON.stringify(options), callbackName);
                } catch (error) {
                    reject(error);
                    delete window[callbackName];
                }
            });
        };
        
        toast = (message) => {
            if (window.ksu && window.ksu.toast) {
                window.ksu.toast(message);
            } else {
                console.log('Toast:', message);
            }
        };
        
        moduleInfo = () => {
            try {
                return window.ksu.moduleInfo ? window.ksu.moduleInfo() : { name: 'CTS For Dimensity8100', version: 'v3.0' };
            } catch (error) {
                return { name: 'CTS For Dimensity8100', version: 'v3.0' };
            }
        };
    } else {
        console.error('KernelSU API 不可用，无法运行WebUI');
        throw new Error('KernelSU API 不可用');
    }
}

// File paths for data
const FILE_PATHS = {
    config: '/sdcard/Android/MW_CpuSpeedController/config.txt',
    configIni: '/storage/emulated/0/Android/MW_CpuSpeedController/config.ini',
    log: '/storage/emulated/0/Android/MW_CpuSpeedController/log.txt',
    moduleProp: '/data/adb/modules/MW_CpuTurboScheduler/module.prop'
};

// Available scheduling modes
const SCHEDULING_MODES = {
    'powersave': '省电模式',
    'balance': '平衡模式', 
    'performance': '性能模式',
    'fast': '极速模式'
};

// Configuration section display names
const SECTION_DISPLAY_NAMES = {
    'meta': '元数据信息',
    'function': '功能开关',
    'LaunchBoost': '启动加速',
    'CoreAllocation': '核心分配',
    'CoreFramework': '核心架构',
    'IO_Settings': 'IO设置',
    'Other': '其他设置',
    'EasSchedulerVaule': 'EAS调度器参数',
    'ParamSchedPath': '调度参数路径',
    'CpuIdle': 'CPU空闲设置',
    'Cpuset': 'CPU集合设置',
    'powersave': '省电模式配置',
    'balance': '平衡模式配置',
    'performance': '性能模式配置',
    'fast': '极速模式配置'
};

// Key display names and descriptions
const KEY_DISPLAY_NAMES = {
    // Meta section
    'name': '芯片名称',
    'author': '作者',
    'configVersion': '配置版本',
    'loglevel': '日志级别',
    
    // Function section
    'DisableQcomGpu': '禁用高通GPU',
    'AffintySetter': '亲和性设置器',
    'CpuIdleScaling_Governor': 'CPU空闲调度器',
    'EasScheduler': 'EAS调度器',
    'cpuset': 'CPUSet功能',
    'LoadBalancing': '负载均衡',
    'EnableFeas': '启用FEAS',
    'AdjIOScheduler': '调整IO调度器',
    'LaunchBoost': '启动加速',
    
    // LaunchBoost section
    'BoostRateMs': '加速持续时间(ms)',
    'FreqMulti': '频率倍数',
    
    // CoreAllocation section
    'cpusetCore': 'CPUSet核心',
    'cpuctlUclampBoostMin': 'CPU使用率控制最小值',
    'cpuctlUclampBoostMax': 'CPU使用率控制最大值',
    
    // CoreFramework section
    'SmallCorePath': '小核CPU路径',
    'MediumCorePath': '中核CPU路径',
    'BigCorePath': '大核CPU路径',
    
    // IO_Settings section
    'Scheduler': 'IO调度器',
    'IO_optimization': 'IO优化',
    
    // Other section
    'AdjQcomBus_dcvs': '调整高通总线DCVS',
    
    // EasSchedulerVaule section
    'sched_min_granularity_ns': '最小调度粒度(ns)',
    'sched_nr_migrate': '迁移数量',
    'sched_wakeup_granularity_ns': '唤醒粒度(ns)',
    'sched_schedstats': '调度统计',
    
    // ParamSchedPath section
    'ParamSchedPath1': '调度参数路径1',
    'ParamSchedPath2': '调度参数路径2',
    'ParamSchedPath3': '调度参数路径3',
    'ParamSchedPath4': '调度参数路径4',
    'ParamSchedPath5': '调度参数路径5',
    'ParamSchedPath6': '调度参数路径6',
    'ParamSchedPath7': '调度参数路径7',
    'ParamSchedPath8': '调度参数路径8',
    'ParamSchedPath9': '调度参数路径9',
    'ParamSchedPath10': '调度参数路径10',
    'ParamSchedPath11': '调度参数路径11',
    'ParamSchedPath12': '调度参数路径12',
    
    // CpuIdle section
    'current_governor': '当前调度器',
    
    // Cpuset section
    'top_app': '前台应用',
    'foreground': '前台进程',
    'restricted': '受限进程',
    'system_background': '系统后台',
    'background': '后台进程',
    
    // Power mode sections
    'scaling_governor': '调度器',
    'UclampTopAppMin': '前台应用最小使用率',
    'UclampTopAppMax': '前台应用最大使用率',
    'UclampTopApplatency_sensitive': '前台应用延迟敏感',
    'UclampForeGroundMin': '前台进程最小使用率',
    'UclampForeGroundMax': '前台进程最大使用率',
    'UclampBackGroundMin': '后台进程最小使用率',
    'UclampBackGroundMax': '后台进程最大使用率',
    'SmallCoreMaxFreq': '小核最大频率',
    'MediumCoreMaxFreq': '中核最大频率',
    'BigCoreMaxFreq': '大核最大频率',
    'ufsClkGate': 'UFS时钟门控',
    'ParamSched1': '调度参数1',
    'ParamSched2': '调度参数2'
};

const KEY_DESCRIPTIONS = {
    // Meta section
    'name': '芯片显示名称',
    'author': '模块开发者',
    'configVersion': '配置文件版本号',
    'loglevel': '日志详细程度设置',
    
    // Function section
    'DisableQcomGpu': '是否禁用高通GPU性能提升',
    'AffintySetter': '是否启用CPU亲和性设置',
    'CpuIdleScaling_Governor': '是否启用CPU空闲调度器',
    'EasScheduler': '是否启用EAS调度器',
    'cpuset': '是否启用CPUSet功能',
    'LoadBalancing': '是否启用负载均衡',
    'EnableFeas': '是否启用FEAS功能',
    'AdjIOScheduler': '是否调整IO调度器',
    'LaunchBoost': '是否启用应用启动加速',
    
    // LaunchBoost section
    'BoostRateMs': '应用启动加速持续时间，单位毫秒',
    'FreqMulti': '启动加速时的频率倍数',
    
    // CoreAllocation section
    'cpusetCore': 'CPUSet使用的核心范围',
    'cpuctlUclampBoostMin': 'CPU使用率控制的最小值',
    'cpuctlUclampBoostMax': 'CPU使用率控制的最大值',
    
    // CoreFramework section
    'SmallCorePath': '小核心的CPU路径索引',
    'MediumCorePath': '中核心的CPU路径索引',
    'BigCorePath': '大核心的CPU路径索引',
    
    // IO_Settings section
    'Scheduler': 'IO调度器类型',
    'IO_optimization': '是否启用IO优化',
    
    // Other section
    'AdjQcomBus_dcvs': '是否调整高通总线DCVS',
    
    // EasSchedulerVaule section
    'sched_min_granularity_ns': 'EAS调度器最小调度粒度',
    'sched_nr_migrate': 'EAS调度器迁移数量',
    'sched_wakeup_granularity_ns': 'EAS调度器唤醒粒度',
    'sched_schedstats': 'EAS调度器统计开关',
    
    // ParamSchedPath section - these are file paths
    'ParamSchedPath1': '调度参数文件路径1，通常为down_rate_limit_us',
    'ParamSchedPath2': '调度参数文件路径2，通常为up_rate_limit_us',
    'ParamSchedPath3': '调度参数文件路径3，可自定义',
    'ParamSchedPath4': '调度参数文件路径4，可自定义',
    'ParamSchedPath5': '调度参数文件路径5，可自定义',
    'ParamSchedPath6': '调度参数文件路径6，可自定义',
    'ParamSchedPath7': '调度参数文件路径7，可自定义',
    'ParamSchedPath8': '调度参数文件路径8，可自定义',
    'ParamSchedPath9': '调度参数文件路径9，可自定义',
    'ParamSchedPath10': '调度参数文件路径10，可自定义',
    'ParamSchedPath11': '调度参数文件路径11，可自定义',
    'ParamSchedPath12': '调度参数文件路径12，可自定义',
    
    // CpuIdle section
    'current_governor': 'CPU空闲状态的调度器',
    
    // Cpuset section
    'top_app': '前台应用使用的CPU核心',
    'foreground': '前台进程使用的CPU核心',
    'restricted': '受限进程使用的CPU核心',
    'system_background': '系统后台进程使用的CPU核心',
    'background': '后台进程使用的CPU核心',
    
    // Power mode sections
    'scaling_governor': 'CPU频率调度器类型',
    'UclampTopAppMin': '前台应用CPU使用率下限',
    'UclampTopAppMax': '前台应用CPU使用率上限',
    'UclampTopApplatency_sensitive': '前台应用是否延迟敏感',
    'UclampForeGroundMin': '前台进程CPU使用率下限',
    'UclampForeGroundMax': '前台进程CPU使用率上限',
    'UclampBackGroundMin': '后台进程CPU使用率下限',
    'UclampBackGroundMax': '后台进程CPU使用率上限',
    'SmallCoreMaxFreq': '小核心最大频率限制',
    'MediumCoreMaxFreq': '中核心最大频率限制',
    'BigCoreMaxFreq': '大核心最大频率限制',
    'ufsClkGate': '是否启用UFS存储时钟门控',
    'ParamSched1': '调度参数1的值',
    'ParamSched2': '调度参数2的值'
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    console.log('WebUI 正在初始化...');
    
    // Initialize core functions first
    initializeAPI();
    initializeTheme();
    
    // Initialize both primary and fallback navigation
    initializeNavigation();
    initFallbackNavigation();
    
    // Then try to initialize the app
    setTimeout(() => {
        try {
            initializeApp();
            console.log('WebUI 已准备就绪');
        } catch (error) {
            console.error('应用初始化错误:', error);
            updateStatusIndicator('error', '初始化失败');
        }
    }, 100);
});

// Initialize app
async function initializeApp() {
    updateStatusIndicator('connecting', '正在连接...');
    
    try {
        // Load module info from module.prop first
        let moduleVersion = 'v3.0'; // default fallback
        let moduleName = 'CTS For Dimensity8100';
        
        const moduleProps = await readModuleProperties();
        if (moduleProps) {
            moduleVersion = moduleProps.version || moduleVersion;
            moduleName = moduleProps.name || moduleName;
        } else {
            // Fallback to KernelSU API
            const info = moduleInfo();
            if (info) {
                moduleVersion = info.version || moduleVersion;
                moduleName = info.name || moduleName;
            }
        }
        
        // Update version display
        document.getElementById('moduleVersion').textContent = moduleVersion;
        // Also update app version to match module version
        document.getElementById('appVersion').textContent = moduleVersion;
        
        // Load system status
        await loadSystemStatus();
        
        // Load initial configuration
        await loadConfigData();
        
        AppState.isConnected = true;
        updateStatusIndicator('connected', '已连接');
        
    } catch (error) {
        console.error('初始化失败:', error);
        updateStatusIndicator('error', '初始化失败');
    }
}

// Read module properties from module.prop file
async function readModuleProperties() {
    try {
        const result = await exec(`cat ${FILE_PATHS.moduleProp}`);
        
        if (result.errno === 0) {
            const moduleProps = {};
            const lines = result.stdout.split('\n');
            
            for (const line of lines) {
                const trimmedLine = line.trim();
                if (trimmedLine && !trimmedLine.startsWith('#')) {
                    const [key, value] = trimmedLine.split('=');
                    if (key && value) {
                        moduleProps[key.trim()] = value.trim();
                    }
                }
            }
            
            return moduleProps;
        }
    } catch (error) {
        console.warn('无法读取 module.prop 文件:', error);
    }
    
    return null;
}

// Load system status
async function loadSystemStatus() {
    try {
        const result = await exec('cat /storage/emulated/0/Android/MW_CpuSpeedController/config.ini');
        
        if (result.errno === 0) {
            // Parse config to get status info
            const configData = parseConfigData(result.stdout);
            
            let configCount = 0;
            Object.keys(configData).forEach(section => {
                configCount += Object.keys(configData[section]).length;
            });
            
            // Update status display
            const statusDiv = document.getElementById('configStatus');
            if (statusDiv) {
                statusDiv.innerHTML = `
                    <div class="status-item">
                        <span class="status-label">配置文件</span>
                        <span class="status-value text-success">已加载</span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">配置项数量</span>
                        <span class="status-value">${configCount}</span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">最后更新</span>
                        <span class="status-value">${new Date().toLocaleString()}</span>
                    </div>
                `;
            }
            
            // Get current mode from config.txt file
            await loadCurrentMode();
        } else {
            console.error('读取配置文件失败');
            updateStatusIndicator('error', '配置文件读取失败');
        }
    } catch (error) {
        console.error('加载系统状态失败:', error);
        updateStatusIndicator('error', '系统状态加载失败');
    }
}

// Load configuration data
async function loadConfigData() {
    try {
        const result = await exec(`cat ${FILE_PATHS.configIni}`);
        
        if (result.errno === 0) {
            const configData = parseConfigData(result.stdout);
            AppState.configData = configData;
            updateConfigDisplay(configData);
        } else {
            console.error('读取配置文件失败');
            updateStatusIndicator('error', '配置文件读取失败');
        }
    } catch (error) {
        console.error('加载配置失败:', error);
        updateStatusIndicator('error', '配置加载失败');
    }
}

// Parse configuration data from INI format
function parseConfigData(content) {
    const lines = content.split('\n');
    const sections = {};
    let currentSection = null;
    
    lines.forEach(line => {
        const trimmed = line.trim();
        
        // Skip comments and empty lines
        if (!trimmed || trimmed.startsWith(';') || trimmed.startsWith('#')) {
            return;
        }
        
        // Check for section headers
        const sectionMatch = trimmed.match(/^\[([^\]]+)\]$/);
        if (sectionMatch) {
            currentSection = sectionMatch[1];
            sections[currentSection] = {};
            return;
        }
        
        // Parse key-value pairs
        const kvMatch = trimmed.match(/^([^=]+)=(.*)$/);
        if (kvMatch && currentSection) {
            const key = kvMatch[1].trim();
            const value = kvMatch[2].trim().replace(/^"(.*)"$/, '$1'); // Remove quotes
            sections[currentSection][key] = value;
        }
    });
    
    return sections;
}

// Update config display
function updateConfigDisplay(configData) {
    const configList = document.getElementById('configList');
    
    if (!configList) return;
    
    // Store original config data for reset functionality
    if (!AppState.originalConfigData) {
        AppState.originalConfigData = JSON.parse(JSON.stringify(configData));
    }
    
    let html = '';
    
    // Regular config sections (without power modes)
    const regularSections = Object.keys(configData).filter(section => 
        !['powersave', 'balance', 'performance', 'fast'].includes(section)
    );
    
    regularSections.forEach(section => {
        html += createConfigSection(section, configData[section], false);
    });
    
    // Add mode selector for power modes
    html += createModeSelector();
    
    // Power mode specific section
    if (configData[AppState.currentMode]) {
        html += createConfigSection(AppState.currentMode, configData[AppState.currentMode], true);
    }
    
    configList.innerHTML = html;
    
    // Add event listeners
    setupConfigEventListeners();
}

// Create mode selector
function createModeSelector() {
    return `
        <div class="config-mode-selector">
            <div class="card">
                <div class="card-header">
                    <div class="card-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7H14A7,7 0 0,1 21,14H22A1,1 0 0,1 23,15V18A1,1 0 0,1 22,19H21V20A2,2 0 0,1 19,22H5A2,2 0 0,1 3,20V19H2A1,1 0 0,1 1,18V15A1,1 0 0,1 2,14H3A7,7 0 0,1 10,7H11V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2M7.5,13A0.5,0.5 0 0,0 7,13.5A0.5,0.5 0 0,0 7.5,14A0.5,0.5 0 0,0 8,13.5A0.5,0.5 0 0,0 7.5,13M16.5,13A0.5,0.5 0 0,0 16,13.5A0.5,0.5 0 0,0 16.5,14A0.5,0.5 0 0,0 17,13.5A0.5,0.5 0 0,0 16.5,13Z"/>
                        </svg>
                    </div>
                    <div class="card-title">功耗模式配置</div>
                </div>
                <div class="card-content">
                    <div class="mode-tabs">
                        <button class="mode-tab ${AppState.currentMode === 'powersave' ? 'active' : ''}" data-mode="powersave">省电模式</button>
                        <button class="mode-tab ${AppState.currentMode === 'balance' ? 'active' : ''}" data-mode="balance">平衡模式</button>
                        <button class="mode-tab ${AppState.currentMode === 'performance' ? 'active' : ''}" data-mode="performance">性能模式</button>
                        <button class="mode-tab ${AppState.currentMode === 'fast' ? 'active' : ''}" data-mode="fast">极速模式</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Create config section
function createConfigSection(section, sectionData, isPowerMode = false) {
    const sectionTitle = isPowerMode ? `功耗模式设置 - ${getModeDisplayName(section)}` : getSectionDisplayName(section);
    const isReadonly = section === 'meta';
    
    let html = `
        <div class="card">
            <div class="card-header">
                <div class="card-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
                    </svg>
                </div>
                <div class="card-title">${sectionTitle}</div>
            </div>
            <div class="card-content">
    `;
    
    Object.keys(sectionData).forEach(key => {
        const value = sectionData[key];
        const control = createConfigControl(section, key, value, isReadonly);
        
        html += `
            <div class="config-item">
                <div class="config-info">
                    <div class="config-title">${getKeyDisplayName(key)}</div>
                    <div class="config-description">${getKeyDescription(key)}</div>
                </div>
                ${control}
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    return html;
}

// Create config control based on key type
function createConfigControl(section, key, value, isReadonly) {
    if (isReadonly) {
        return `<div class="config-value readonly-value">${formatConfigValue(value)}</div>`;
    }
    
    const fieldId = `${section}_${key}`;
    
    // Boolean values
    if (value === 'true' || value === 'false') {
        const checked = value === 'true';
        return `
            <div class="config-control">
                <div class="switch-control ${checked ? 'checked' : ''}" onclick="toggleSwitch('${fieldId}', '${section}', '${key}')">
                    <div class="switch-thumb"></div>
                </div>
            </div>
        `;
    }
    
    // Special dropdown fields
    if (key === 'loglevel') {
        return `
            <div class="config-control">
                <select id="${fieldId}" onchange="updateConfigValue('${section}', '${key}', this.value)">
                    <option value="DEBUG" ${value === 'DEBUG' ? 'selected' : ''}>DEBUG</option>
                    <option value="INFO" ${value === 'INFO' ? 'selected' : ''}>INFO</option>
                    <option value="WARNING" ${value === 'WARNING' ? 'selected' : ''}>WARNING</option>
                    <option value="ERROR" ${value === 'ERROR' ? 'selected' : ''}>ERROR</option>
                </select>
            </div>
        `;
    }
    
    if (key === 'Scheduler') {
        return `
            <div class="config-control">
                <select id="${fieldId}" onchange="updateConfigValue('${section}', '${key}', this.value)">
                    <option value="" ${value === '' ? 'selected' : ''}>默认</option>
                    <option value="mq-deadline" ${value === 'mq-deadline' ? 'selected' : ''}>MQ-Deadline</option>
                    <option value="bfq" ${value === 'bfq' ? 'selected' : ''}>BFQ</option>
                    <option value="cfq" ${value === 'cfq' ? 'selected' : ''}>CFQ</option>
                    <option value="deadline" ${value === 'deadline' ? 'selected' : ''}>Deadline</option>
                    <option value="noop" ${value === 'noop' ? 'selected' : ''}>Noop</option>
                </select>
            </div>
        `;
    }
    
    if (key === 'scaling_governor') {
        return `
            <div class="config-control">
                <select id="${fieldId}" onchange="updateConfigValue('${section}', '${key}', this.value)">
                    <option value="schedutil" ${value === 'schedutil' ? 'selected' : ''}>Schedutil</option>
                    <option value="performance" ${value === 'performance' ? 'selected' : ''}>Performance</option>
                    <option value="powersave" ${value === 'powersave' ? 'selected' : ''}>Powersave</option>
                    <option value="conservative" ${value === 'conservative' ? 'selected' : ''}>Conservative</option>
                    <option value="ondemand" ${value === 'ondemand' ? 'selected' : ''}>Ondemand</option>
                </select>
            </div>
        `;
    }
    
    if (key === 'current_governor') {
        return `
            <div class="config-control">
                <select id="${fieldId}" onchange="updateConfigValue('${section}', '${key}', this.value)">
                    <option value="" ${value === '' ? 'selected' : ''}>默认</option>
                    <option value="menu" ${value === 'menu' ? 'selected' : ''}>menu</option>
                    <option value="ladder" ${value === 'ladder' ? 'selected' : ''}>ladder</option>
                    <option value="teo" ${value === 'teo' ? 'selected' : ''}>teo</option>
                </select>
            </div>
        `;
    }
    
    // Numeric inputs with specific ranges
    if (key.includes('Freq')) {
        return `
            <div class="config-control">
                <input type="number" id="${fieldId}" class="frequency-input" 
                       value="${value}" min="0" max="3000000" step="10000"
                       onchange="updateConfigValue('${section}', '${key}', this.value)" />
                <span class="input-unit">Hz</span>
            </div>
        `;
    }
    
    if (key.includes('Uclamp') || key.includes('UclampBoost')) {
        return `
            <div class="config-control">
                <input type="number" id="${fieldId}" class="number-input" 
                       value="${value}" min="0" max="100" 
                       onchange="updateConfigValue('${section}', '${key}', this.value)" />
                <span class="input-unit">%</span>
            </div>
        `;
    }
    
    if (key.includes('BoostRateMs')) {
        return `
            <div class="config-control">
                <input type="number" id="${fieldId}" class="number-input" 
                       value="${value}" min="100" max="5000" step="100"
                       onchange="updateConfigValue('${section}', '${key}', this.value)" />
                <span class="input-unit">ms</span>
            </div>
        `;
    }
    
    if (key.includes('FreqMulti')) {
        return `
            <div class="config-control">
                <input type="number" id="${fieldId}" class="number-input" 
                       value="${value}" min="1.0" max="3.0" step="0.1"
                       onchange="updateConfigValue('${section}', '${key}', this.value)" />
                <span class="input-unit">倍</span>
            </div>
        `;
    }
    
    if (key.includes('Path') || key === 'sched_schedstats' || key === 'UclampTopApplatency_sensitive') {
        return `
            <div class="config-control">
                <input type="number" id="${fieldId}" class="number-input" 
                       value="${value}" min="0" max="10" 
                       onchange="updateConfigValue('${section}', '${key}', this.value)" />
            </div>
        `;
    }
    
    if (key.includes('sched_nr_migrate')) {
        return `
            <div class="config-control">
                <input type="number" id="${fieldId}" class="number-input" 
                       value="${value}" min="1" max="100" 
                       onchange="updateConfigValue('${section}', '${key}', this.value)" />
            </div>
        `;
    }
    
    if (key.includes('granularity_ns')) {
        return `
            <div class="config-control">
                <input type="number" id="${fieldId}" class="number-input" 
                       value="${value}" min="1000000" max="10000000" step="100000"
                       onchange="updateConfigValue('${section}', '${key}', this.value)" />
                <span class="input-unit">ns</span>
            </div>
        `;
    }
    
    if (key.includes('ParamSched')) {
        return `
            <div class="config-control">
                <input type="number" id="${fieldId}" class="number-input" 
                       value="${value}" min="0" max="10000" 
                       onchange="updateConfigValue('${section}', '${key}', this.value)" />
            </div>
        `;
    }
    
    // Range inputs for core assignments
    if (key.includes('cpusetCore') || key.includes('top_app') || key.includes('foreground') || 
        key.includes('restricted') || key.includes('system_background') || key.includes('background')) {
        return `
            <div class="config-control">
                <input type="text" id="${fieldId}" class="range-input" 
                       value="${value}" placeholder="0-7" 
                       onchange="updateConfigValue('${section}', '${key}', this.value)" />
            </div>
        `;
    }
    
    // ParamSchedPath inputs - text inputs for file paths
    if (key.includes('ParamSchedPath')) {
        return `
            <div class="config-control">
                <input type="text" id="${fieldId}" class="text-input" 
                       value="${value}" placeholder="参数文件路径"
                       onchange="updateConfigValue('${section}', '${key}', this.value)" />
            </div>
        `;
    }
    
    // Default text input
    return `
        <div class="config-control">
            <input type="text" id="${fieldId}" value="${value}" 
                   onchange="updateConfigValue('${section}', '${key}', this.value)" />
        </div>
    `;
}

// Get mode display name
function getModeDisplayName(mode) {
    return SCHEDULING_MODES[mode] || mode;
}

// Get section display name
function getSectionDisplayName(section) {
    return SECTION_DISPLAY_NAMES[section] || section;
}

// Get key display name
function getKeyDisplayName(key) {
    return KEY_DISPLAY_NAMES[key] || key;
}

// Get key description
function getKeyDescription(key) {
    return KEY_DESCRIPTIONS[key] || '';
}

// Format config value for display
function formatConfigValue(value) {
    if (value === 'true') return '启用';
    if (value === 'false') return '禁用';
    return value;
}

// Update config value
function updateConfigValue(section, key, value) {
    if (!AppState.configData || !AppState.configData[section]) return;
    
    AppState.configData[section][key] = value;
    AppState.isConfigModified = true;
    
    // Enable save button
    const saveBtn = document.getElementById('saveConfigBtn');
    if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.classList.add('modified');
    }
    
    console.log(`配置更新: ${section}.${key} = ${value}`);
}

// Toggle switch control
function toggleSwitch(fieldId, section, key) {
    const switchElement = document.querySelector(`[onclick*="${fieldId}"]`);
    if (!switchElement) return;
    
    const isChecked = switchElement.classList.contains('checked');
    const newValue = !isChecked;
    
    if (newValue) {
        switchElement.classList.add('checked');
    } else {
        switchElement.classList.remove('checked');
    }
    
    updateConfigValue(section, key, newValue.toString());
}

// Setup config event listeners
function setupConfigEventListeners() {
    // Mode tab handlers (only for config page)
    document.querySelectorAll('#configPage .mode-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const mode = e.target.dataset.mode;
            if (mode && mode !== AppState.currentMode) {
                AppState.currentMode = mode;
                
                // Update active tab
                document.querySelectorAll('#configPage .mode-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                
                // Reload config display
                updateConfigDisplay(AppState.configData);
            }
        });
    });
    
    // Save config button
    const saveBtn = document.getElementById('saveConfigBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveConfiguration);
    }
    
    // Reset config button
    const resetBtn = document.getElementById('resetConfigBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetConfiguration);
    }
}

// Save configuration
async function saveConfiguration() {
    if (!AppState.configData) {
        showToast('没有配置数据可保存', 'error');
        return;
    }
    
    try {
        // Generate INI format
        let iniContent = '';
        
        Object.keys(AppState.configData).forEach(section => {
            iniContent += `[${section}]\n`;
            
            Object.keys(AppState.configData[section]).forEach(key => {
                const value = AppState.configData[section][key];
                iniContent += `${key} = "${value}"\n`;
            });
            
            iniContent += '\n';
        });
        
        // Save to file
        const result = await exec(`echo '${iniContent}' > ${FILE_PATHS.configIni}`);
        
        if (result.errno === 0) {
            AppState.isConfigModified = false;
            const saveBtn = document.getElementById('saveConfigBtn');
            if (saveBtn) {
                saveBtn.disabled = true;
                saveBtn.classList.remove('modified');
            }
            showToast('配置保存成功');
        } else {
            showToast('配置保存失败', 'error');
        }
        
    } catch (error) {
        console.error('保存配置失败:', error);
        showToast('配置保存失败', 'error');
    }
}

// Reset configuration
function resetConfiguration() {
    if (!AppState.originalConfigData) {
        showToast('没有原始配置数据', 'error');
        return;
    }
    
    if (confirm('确定要重置所有配置到初始状态吗？')) {
        AppState.configData = JSON.parse(JSON.stringify(AppState.originalConfigData));
        updateConfigDisplay(AppState.configData);
        
        AppState.isConfigModified = false;
        const saveBtn = document.getElementById('saveConfigBtn');
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.classList.remove('modified');
        }
        
        showToast('配置已重置');
    }
}

// Update mode display on status page
function updateModeDisplay(mode) {
    // Clear all active mode tabs
    document.querySelectorAll('#statusPage .mode-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Validate mode and use default if invalid
    if (!['powersave', 'balance', 'performance', 'fast'].includes(mode)) {
        mode = 'balance'; // default fallback
    }
    
    // Activate the current mode tab
    const modeTab = document.querySelector(`#statusPage .mode-tab[data-mode="${mode}"]`);
    if (modeTab) {
        modeTab.classList.add('active');
        console.log('已激活模式标签:', mode);
    } else {
        console.warn('未找到模式标签:', mode);
    }
    
    // Update AppState if needed
    if (AppState.currentMode !== mode) {
        AppState.currentMode = mode;
    }
}

// Load log data
async function loadLogData() {
    try {
        const result = await exec(`cat ${FILE_PATHS.log}`);
        
        if (result.errno === 0) {
            updateLogDisplay(result.stdout);
        } else {
            console.error('读取日志文件失败');
            updateLogDisplay('无法读取日志文件');
        }
    } catch (error) {
        console.error('加载日志失败:', error);
        updateLogDisplay('日志加载失败: ' + error.message);
    }
}

// Update log display
function updateLogDisplay(logContent) {
    const logContainer = document.getElementById('logContainer');
    if (!logContainer) return;
    
    const lines = logContent.split('\n').filter(line => line.trim());
    let html = '';
    
    lines.forEach(line => {
        const logClass = getLogClass(line);
        html += `<div class="log-entry ${logClass}">${escapeHtml(line)}</div>`;
    });
    
    logContainer.innerHTML = html || '<div class="log-entry">暂无日志数据</div>';
    
    // Scroll to bottom
    logContainer.scrollTop = logContainer.scrollHeight;
}

// Get log entry class based on log level
function getLogClass(line) {
    if (line.includes('[ERROR]')) return 'log-error';
    if (line.includes('[WARNING]')) return 'log-warning';
    if (line.includes('[DEBUG]')) return 'log-debug';
    return 'log-info';
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Update status indicator
function updateStatusIndicator(status, message) {
    const indicatorDot = document.querySelector('.indicator-dot');
    const indicatorText = document.querySelector('.indicator-text');
    
    if (indicatorDot) {
        indicatorDot.className = `indicator-dot ${status}`;
    }
    
    if (indicatorText) {
        indicatorText.textContent = message;
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    if (typeof toast === 'function') {
        toast(message);
    } else {
        console.log(`Toast (${type}):`, message);
        
        // Create a simple toast notification
        const toastEl = document.createElement('div');
        toastEl.className = `toast toast-${type}`;
        toastEl.textContent = message;
        toastEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            border-radius: 8px;
            color: white;
            font-size: 14px;
            z-index: 10000;
            background: ${type === 'error' ? '#f44336' : '#4caf50'};
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        document.body.appendChild(toastEl);
        
        setTimeout(() => {
            toastEl.remove();
        }, 3000);
    }
}

// Initialize theme
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'auto';
    AppState.theme = savedTheme;
    applyTheme(savedTheme);
    
    // Update theme selector
    const themeTab = document.querySelector(`[data-theme="${savedTheme}"]`);
    if (themeTab) {
        document.querySelectorAll('[data-theme]').forEach(t => t.classList.remove('active'));
        themeTab.classList.add('active');
    }
}

// Apply theme
function applyTheme(theme) {
    const root = document.documentElement;
    
    if (theme === 'dark') {
        root.classList.add('dark-theme');
        root.classList.remove('light-theme');
    } else if (theme === 'light') {
        root.classList.add('light-theme');
        root.classList.remove('dark-theme');
    } else {
        // Auto theme - use system preference
        root.classList.remove('dark-theme', 'light-theme');
        
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            root.classList.add('dark-theme');
        } else {
            root.classList.add('light-theme');
        }
    }
}

// Initialize navigation
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            if (page) {
                switchPage(page);
                
                // Update active nav item
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                
                AppState.currentPage = page;
            }
        });
    });
    
    // Theme selector
    document.querySelectorAll('[data-theme]').forEach(themeBtn => {
        themeBtn.addEventListener('click', (e) => {
            const theme = e.target.closest('[data-theme]').dataset.theme;
            AppState.theme = theme;
            localStorage.setItem('theme', theme);
            applyTheme(theme);
            
            // Update active theme button
            document.querySelectorAll('[data-theme]').forEach(t => t.classList.remove('active'));
            e.target.closest('[data-theme]').classList.add('active');
        });
    });
    
    // Log level selector
    document.querySelectorAll('.log-level-tab').forEach(levelBtn => {
        levelBtn.addEventListener('click', (e) => {
            const level = e.target.closest('[data-level]').dataset.level;
            AppState.currentLogLevel = level;
            
            // Update active log level button
            document.querySelectorAll('.log-level-tab').forEach(t => t.classList.remove('active'));
            e.target.closest('[data-level]').classList.add('active');
            
            // Filter logs (could implement this later)
            console.log('切换日志级别到:', level);
        });
    });
    
    // Refresh log button
    const refreshBtn = document.getElementById('refreshLogBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            console.log('刷新日志数据...');
            await loadLogData();
            showToast('日志已刷新');
        });
    }
    
    // Refresh status button
    const refreshStatusBtn = document.getElementById('refreshStatusBtn');
    if (refreshStatusBtn) {
        refreshStatusBtn.addEventListener('click', async () => {
            console.log('刷新状态数据...');
            await loadSystemStatus();
            showToast('状态已刷新');
        });
    }
}

// Fallback navigation (in case primary fails)
function initFallbackNavigation() {
    // Ensure page switching works even if primary navigation fails
    setTimeout(() => {
        const statusNav = document.querySelector('[data-page="status"]');
        const configNav = document.querySelector('[data-page="config"]');
        const logNav = document.querySelector('[data-page="log"]');
        const settingsNav = document.querySelector('[data-page="settings"]');
        
        if (statusNav && !statusNav.onclick) {
            statusNav.onclick = () => switchPage('status');
        }
        if (configNav && !configNav.onclick) {
            configNav.onclick = () => switchPage('config');
        }
        if (logNav && !logNav.onclick) {
            logNav.onclick = () => switchPage('log');
        }
        if (settingsNav && !settingsNav.onclick) {
            settingsNav.onclick = () => switchPage('settings');
        }
    }, 500);
}

// Switch page
function switchPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
    });
    
    // Show target page
    const targetPage = document.getElementById(`${pageId}Page`);
    if (targetPage) {
        targetPage.classList.remove('hidden');
    }
    
    // Load page-specific data
    if (pageId === 'config' && !AppState.configData) {
        loadConfigData();
    } else if (pageId === 'log') {
        loadLogData();
    }
    
    console.log(`切换到页面: ${pageId}`);
}

// Load current mode from config.txt
async function loadCurrentMode() {
    try {
        const result = await exec(`cat ${FILE_PATHS.config}`);
        
        if (result.errno === 0) {
            const currentMode = result.stdout.trim();
            console.log('从config.txt读取到当前模式:', currentMode);
            
            // Validate mode and update display
            if (['powersave', 'balance', 'performance', 'fast'].includes(currentMode)) {
                AppState.currentMode = currentMode;
                updateModeDisplay(currentMode);
            } else {
                console.warn('无效的模式值:', currentMode, '使用默认模式: balance');
                AppState.currentMode = 'balance';
                updateModeDisplay('balance');
            }
        } else {
            console.warn('无法读取config.txt文件，使用默认模式: balance');
            AppState.currentMode = 'balance';
            updateModeDisplay('balance');
        }
    } catch (error) {
        console.error('读取当前模式失败:', error);
        // Use default mode
        AppState.currentMode = 'balance';
        updateModeDisplay('balance');
    }
}
