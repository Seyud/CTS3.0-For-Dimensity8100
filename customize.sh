ClearConfig(){
    rm -rf  /sdcard/Android/MW_CpuSpeedController/config.ini
    mkdir  /sdcard/Android/MW_CpuSpeedController
    sleep 0.2s
    touch /sdcard/Android/MW_CpuSpeedController/config.ini
}
enforce_install_from_magisk_app() {
echo "欢迎使用CpuTurboScheduler调度"
echo "感谢:
CookApk@:ztc1997
CookApk@:Nep_Timeline
CoolApk@:XShee
CoolApk@:RalseiNEO
CoolApk@:hfdem
QQ@:shrairo
QQ@长虹久奕.
提供的技术支持"
echo "感谢:
CoolApk@机型质检员
CoolApk@瓦力喀
为本模块提供webui支持"
cp $MODPATH/config.ini  /sdcard/Android/MW_CpuSpeedController/config.ini
sleep 0.3s
rm -rf $MODPATH/config.ini
}

Init(){
killall -9 MW_CpuSpeedController
sh $MODPATH/vtools/init_vtools.sh $(realpath $MODPATH/module.prop)
echo " balance" > /sdcard/Android/MW_CpuSpeedController/config.txt
}

ClearConfig
enforce_install_from_magisk_app
Init