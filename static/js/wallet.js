function saveKeystoreNext() {
    //隐藏保存keystore页面
    $("#save-keystore").hide()
    //显示保存private页面
    $("#save-privatekey").show()
}

function configAccountInfo(data) {
    $("#accountAddress").text(data.address)
    $("#accountBalance").text(data.balance + " ETH")
    // 隐藏
    $("#transaction0").hide()
    $("#transaction1").show()

    $("input[name=fromAddress]").val(data.address)
    $("input[name=privateKey]").val(data.privatekey)
}

function unlockAccountWithPK() {
    var privateKey = $("#inputAccountType1").val()
    console.log(privateKey)
    //将私钥传至服务端
    $.post("/unlockWithPK", `privatekey=${privateKey}`, function (res, status) {
        console.log(status + JSON.stringify(res))
        //将服务端返回的账户信息显示到页面上
        if (res.code == 0) {
            configAccountInfo(res.data)
        }
    })
}

function unlockAccountWithKS() {
    var filedata = $("#inputAccountType0").val()
    if (filedata.length <= 0) {
        alert("未选择文件，请选择文件上传!")
        return
    }
    //文件上传通过Formdata去存储文件的数据
    var data = new FormData()
    data.append("file", $("#inputAccountType0")[0].files[0])
    data.append("password", $("#inputAccountTypePassword").val())
    //提交到后端的路径
    var urlStr = "/unlockWithKS"
    $.ajax({
        url: urlStr,
        type: "post",
        dataType: "json",
        contentType: false,
        data: data,
        processData: false,
        success: function (res, status) {
            alert("解锁成功，可以使用该账户进行转账操作")
            if (res.code == 0) {
                configAccountInfo(res.data)
            }

        },
        error: function (res, status) {
            alert("KeyStore文件与密码不匹配")

        }
    })


}


//转账 对元素的操作需要等文档加载完毕后才能调用成功
$(document).ready(function () {
    $("input[name=unlockAccountType]").change(function () {
        if (this.value == 0) {
            //如果点击keystore，则显示keystore操作
            $("#unlockAccount0").show()
            $("#unlockAccount1").hide()
        } else {
            $("#unlockAccount0").hide()
            $("#unlockAccount1").show()
        }
    })

    $("#sendTransactionForm").validate({
        rules: {
            toAddress: {
                required: true,
            },
            amount: {
                required: true,
            },
        },
        messages: {
            toAddress: {
                required: "请输入对方钱包地址",
            },
            amount: {
                required: "请输入转账金额",
            },
        },
        submitHandler: function (form) {
            var urlStr = "/sendtransaction"
            alert("urlStr:" + urlStr)
            $(form).ajaxSubmit({
                url: urlStr,
                type: "post",
                dataType: "json",
                success: function (res, status) {
                    console.log(status + JSON.stringify(res))
                    if (res.code == 0) {
                        $("#transactionCompleteHash0").text(res.data.transactionHash)
                        $("#transactionCompleteHash1").text(res.data.blockHash)
                        $("#transactionComplete").show()
                    }
                },
                error: function (res, status) {
                    console.log(status + JSON.stringify(res))

                }
            })
        }
    })


})

//查询交易详情
function queryTransaction() {
    var txHash = $("#txHash").val()
    $.post("/queryTransaction", "txHash=" + txHash, function (res, status) {
        console.log(status + JSON.stringify(res))
        if (res.code == 0) {
            alert("查询成功")
            $("#transactionInfo").text(JSON.stringify(res.data, null, 4))
        } else {
            alert("查询失败")
        }
    })
}