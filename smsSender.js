const https = require('follow-redirects').https;

function sendSMS(phone) {
    const options = {
        method: 'POST',
        hostname: 'nmlj62.api.infobip.com',
        path: '/sms/2/text/advanced',
        headers: {
            'Authorization': 'App b80fdf825696894347f120c71d77b117-076bf5fa-6509-4494-8e56-29c2800eb0c4',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        maxRedirects: 20
    };

    const req = https.request(options, function (res) {
        let chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", function () {
            const body = Buffer.concat(chunks);
            console.log(body.toString());
        });

        res.on("error", function (error) {
            console.error(error);
        });
    });

    const postData = JSON.stringify({
        messages: [
            {
                destinations: [{ to: phone }],
                from: "447491163443",
                text: `Congratulations on sending your first message. Go ahead and check the delivery report in the next step to ${phone}`
            }
        ]
    });

    req.write(postData);
    req.end();
}

// Пример вызова функции
const phone = '233509868902'; // Замените номер на нужный
sendSMS(phone);
