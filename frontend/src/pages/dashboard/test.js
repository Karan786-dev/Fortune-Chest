import Head from 'next/head'
import React from 'react'

export default function test() {
    let order_id = 'UPI495fnnf66697h'
    let api_link = 'https://2pay.infomattic.com/init_payment.php'
    let merchant_key = '0959311372483'
    return (
        <>
            <Head>

                <title>UPI Gateway Integration</title>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="https://upi.infomattic.com/images/favicon.png" type="image/gif" />

                <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css" />
                <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
                <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>

                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
                <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@600&display=swap" rel="stylesheet" />
            </Head>
            <div className="container">
                <br /><br />
                <h3 className="text-center">UPI Gateway Integration - v1</h3>
                <br /><br />
                <div className="row">
                    <div className="col-sm-4">
                        <div className="well">
                            <p className="order_id">Order ID : {order_id}</p>
                            <hr />
                            <form action={api_link} method="post">
                                <input type="hidden" name="order_id" value={order_id} />
                                <input type="hidden" name="pid" value={merchant_key} />
                                <div className="form-group">
                                    <label>Purpose</label>
                                    <input type="text" className="form-control" name="purpose" placeholder="Purpose of payment" required />
                                </div>
                                <div className="form-group">
                                    <label>Amount</label>
                                    <input type="text" className="form-control" name="amt" placeholder="Amount" required />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input type="email" className="form-control" name="email" placeholder="Email id" required />
                                </div>
                                <br />
                                <button type="submit" name="submit" className="btn btn-success btn-block">Proceed</button>
                            </form>
                        </div></div>
                </div></div>
        </>
    )
}
