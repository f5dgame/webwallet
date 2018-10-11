function saveKeystoreNext(){
    //隐藏保存keystore页面
    $("#save-keystore").hide()
    //显示保存private页面
    $("#save-privatekey").show()
}

function unlockAccountWithPK(){
    var privateKey = $("#inputAccountType1").val()
    console.log(privateKey)
    //将私钥传至服务端
    $.post("/unlockWithPK",`privatekey=${privateKey}`,function(res,status){
        console.log(status + JSON.stringify(res))
    })
}

// 对元素的操作需要等文档加载完毕后才能调用成功
$(document).ready(function (){
    $("input[name=unlockAccountType]").change(function(){
        if (this.value == 0) {
            //如果点击keystore，则显示keystore操作
            $("#unlockAccount0").show()
            $("#unlockAccount1").hide()
        }else {
            $("#unlockAccount0").hide()
            $("#unlockAccount1").show()

        }
       

    })
})
