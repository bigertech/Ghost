function addblank(inText)
{
    return inText.replace(/([\u4E00-\u9FA3])([A-Za-z0-9\(\[\{@#])/g,'$1 $2')
        .replace(/([A-Za-z0-9\.,!@#%?\)\]\}])([\u4E00-\u9FA3])/g,'$1 $2')
        .replace(/([〔〕（）。，！？《》—“”「」]) +/g,'$1')
        .replace(/ +([〔〕（）。，！？《》—“”「」])/g,'$1')
        .replace(/ +/g,' ')
        .replace(/“/g,"「")
        .replace(/”/g,"」")
        .replace(/‘/g,"『")
        .replace(/’/g,"』");
}
var text = '3月22日，Apple公司宣布：“我们不干啦！”';
console.log(addblank(text));