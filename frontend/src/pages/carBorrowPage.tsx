import {Button, Image} from 'antd';
import {Header} from "../asset";
import {UserOutlined} from "@ant-design/icons";
import {useEffect, useState} from 'react';
import {borrowYourCarContract, web3, myERC20Contract} from "../utils/contracts";
import './carBorrowPage.css';

const GanacheTestChainId = '1337' // Ganache的ChainId = 1337
// TODO change according to your configuration
const GanacheTestChainName = 'Ganache Test Chain'
const GanacheTestChainRpcUrl = 'http://127.0.0.1:7545'

const CarBorrowPage = () => {
    const images = [
        require('./picture/1.jpg'),
        require('./picture/2.jpg'),
        require('./picture/3.jpg'),
        require('./picture/4.jpg'),
        require('./picture/5.jpg'),
        require('./picture/6.jpg'),
        require('./picture/7.jpg'),
        require('./picture/8.jpg'),
        require('./picture/9.jpg'),
        require('./picture/10.jpg'),
        require('./picture/11.jpg'),
    ]

    const [account, setAccount] = useState('')
    const [accountBalance, setAccountBalance] = useState(0)

    const [ownedCars , setOwnedCars] = useState([])
    const [unborrowedCars, setUnborrowedCars] = useState([])
    const [tokenIdToLookUp, setTokenIdToLookUp] = useState('')
    const [tokenIdToBorrow, setTokenIdToBorrow] = useState('')
    const [borrowMinutes, setBorrowMinutes] = useState('')
    const [carOwner, setCarOwner] = useState('')
    const [carUser, setCarUser] = useState('')
    const [costPerToken , setCostPerToken] = useState('')
    const [costPerMinute, setCostPerMinute] = useState('')
    const [resultFlag, setResultFlag] = useState(0)

    useEffect(() => {
        // 初始化检查用户是否已经连接钱包
        // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
        const initCheckAccounts = async () => {
            // @ts-ignore
            const {ethereum} = window;
            if (Boolean(ethereum && ethereum.isMetaMask)) {
                // 尝试获取连接的用户账户
                web3.eth.getAccounts((error: Error, accounts: string[]) => {
                    if (error) {
                        console.error(Error);
                    } else {
                        if(accounts && accounts.length) {
                            setAccount(accounts[0])
                        }
                    }
                });
            }
        }

        initCheckAccounts()

    }, [])

    const onClickConnectWallet = async () => {
        // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
        // @ts-ignore
        const {ethereum} = window;
        if (!Boolean(ethereum && ethereum.isMetaMask)) {
            alert('MetaMask is not installed!');
            return
        }

        try {
            // 如果当前小狐狸不在本地链上，切换Metamask到本地测试链
            if (ethereum.chainId !== GanacheTestChainId) {
                const chain = {
                    chainId: GanacheTestChainId, // Chain-ID
                    chainName: GanacheTestChainName, // Chain-Name
                    rpcUrls: [GanacheTestChainRpcUrl], // RPC-URL
                };

                try {
                    // 尝试切换到本地网络
                    await ethereum.request({method: "wallet_switchEthereumChain", params: [{chainId: chain.chainId}]})
                } catch (switchError: any) {
                    // 如果本地网络没有添加到Metamask中，添加该网络
                    if (switchError.code === 4902) {
                        await ethereum.request({ method: 'wallet_addEthereumChain', params: [chain]
                        });
                    }
                }
            }

            // 小狐狸成功切换网络了，接下来让小狐狸请求用户的授权
            await ethereum.request({method: 'eth_requestAccounts'});
            // 获取小狐狸拿到的授权用户列表
            const accounts = await ethereum.request({method: 'eth_accounts'});
            // 如果用户存在，展示其account，否则显示错误信息
            setAccount(accounts[0] || 'Not able to get accounts');
        } catch (error: any) {
            alert(error.message)
        }
    }

    useEffect(() => {
        const getBorrowYourCarContractInfo = async () => {
            if (borrowYourCarContract) {
                const cpt = await borrowYourCarContract.methods.getCostPerToken().call()
                setCostPerToken(cpt.toString());
                const cpm = await borrowYourCarContract.methods.getCostPerMinute().call()
                setCostPerMinute(cpm.toString());
            } else {
                alert('Contract not exists.')
            }
        }

        getBorrowYourCarContractInfo()
    }, [])

    useEffect(() => {
        const getAccountInfo = async () => {
            if (myERC20Contract) {
                const ab = await myERC20Contract.methods.balanceOf(account).call()
                setAccountBalance(ab)
            } else {
                alert('Contract not exists.')
            }
        }

        if(account !== '') {
            getAccountInfo()
        }
    }, [account])

    useEffect(() => {
        if (borrowYourCarContract) {
            borrowYourCarContract.events.GetCarBorrowed()
                .on('data', (event: any) => {
                    const carsBorrowed = event.returnValues[0]; // 获取事件返回的结果
                    setUnborrowedCars(carsBorrowed);
                    console.log(unborrowedCars);
                })
                .on('error', (error: any) => {
                    console.error(error);
                });
        }
    }, [borrowYourCarContract]);

    useEffect(() => {
        if (borrowYourCarContract) {
            borrowYourCarContract.events.GetCarOwned()
                .on('data', (event:any) => {
                    const carsOwned = event.returnValues[0]; // 获取事件返回的结果
                    setOwnedCars(carsOwned);
                    console.log(carsOwned);
                })
                .on('error', (error:any) => {
                    console.error(error);
                });
        }
    }, [borrowYourCarContract]);

    const onClaimTokenAirdrop = async () => {
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }

        if (myERC20Contract) {
            try {
                await myERC20Contract.methods.airdrop().send({
                    from: account
                })
                alert('You have claimed ZJU Token.')
            } catch (error: any) {
                alert(error.message)
            }

        } else {
            alert('Contract not exists.')
        }
    }

    const onBuyToken = async () => {
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }

        if (borrowYourCarContract) {
            try {
                await borrowYourCarContract.methods.mintWithEther().send({
                    from: account,
                    value: costPerToken,
                    timestamp: new Date().getTime() / 1000

                })
                alert('succeed to mint a NFT')
            } catch (error: any) {
                alert(error.message)
            }

        } else {
            alert('Contract not exists.')
        }
    }

    const onGetMyCars = async () => {
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }

        if (borrowYourCarContract) {
            try {
                await borrowYourCarContract.methods.getCarOwned().send({
                    from: account,
                })
                setResultFlag(1)
            } catch (error: any) {
                alert(error.message)
            }

        } else {
            alert('Contract not exists.')
        }
    }

    const onGetUnborrowedCars = async () => {
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }

        if (borrowYourCarContract) {
            try {
                await borrowYourCarContract.methods.getUnborrowedCar().send({
                    from: account,
                    timestamp: new Date().getTime() / 1000
                })
                setResultFlag(2)
            } catch (error: any) {
                alert(error.message)
            }

        } else {
            alert('Contract not exists.')
        }
    }

    const onLookUpToken = async () => {
        if(!tokenIdToLookUp){
            alert('Please input tokenId.')
            return
        }

        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }

        if (borrowYourCarContract) {
            try {
                const carOwner = await borrowYourCarContract.methods.getCarOwner(tokenIdToLookUp).call()
                setCarOwner(carOwner)
                console.log(carOwner)
                const carUser = await borrowYourCarContract.methods.getCarUser(tokenIdToLookUp).call()
                setCarUser(carUser)
                console.log(carUser)
                setResultFlag(3)
            } catch (error: any) {
                alert(error.message)
            }
        } else {
            alert('Contract not exists.')
        }
    }

    const onBorrowCar = async () => {
        if(!tokenIdToBorrow){
            alert('Please input tokenId.')
            return
        }
        if(!borrowMinutes){
            alert('Please input borrowing duration.')
            return
        }

        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }

        if (borrowYourCarContract && myERC20Contract) {
            try {
                await myERC20Contract.methods.approve(borrowYourCarContract.options.address, parseInt(costPerMinute) * parseInt(borrowMinutes)).send({
                    from: account
                })
                await borrowYourCarContract.methods.borrowCar(tokenIdToBorrow, borrowMinutes).send({
                    from: account,
                    timestamp: new Date().getTime() / 1000
                })
            } catch (error: any) {
                alert(error.message)
            }
        } else {
            alert('Contract not exists.')
        }
    }

    function renderCarList(carList:string[], title:string) {
        return (
            <>
                <div style={{ margin: '5px' }}>{title}</div>
                {carList.length !== 0 && (
                    <table>
                        <thead>
                        <tr>
                            <th>TokenID</th>
                            <th>Image</th>
                        </tr>
                        </thead>
                        <tbody>
                        {carList.map((tokenId) => (
                            <tr key={tokenId}>
                                <td className="cell">{tokenId}</td>
                                <td className="cell">
                                    <Image
                                        src={images[parseInt(tokenId) % 11]}
                                        preview={false}
                                        className='image'
                                    />
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </>
        );
    }

    return (
        <>
            <div className='container'>
                <Image
                    width='100%'
                    height='300px'
                    preview={false}
                    src={Header}
                />
                <div className='main'>
                    <h1>汽车借用系统</h1>
                    <div className='account'>
                        {account === '' && <Button onClick={onClickConnectWallet}>连接钱包</Button>}
                        <div style={{margin: '5px'}}>当前用户：{account === '' ? '无用户连接' : account}</div>
                        <div style={{margin: '5px'}}>当前用户拥有ZX币数量：{account === '' ? 0 : accountBalance}</div>
                        <div style={{margin: '5px'}}>当前汽车NFT单价:{web3.utils.fromWei(costPerToken, "finney")}finney</div>
                    </div>
                    <div className='operation'>
                        <div className='buttons'>
                            <Button style={{width: '200px',margin: '5px'}} onClick={onClaimTokenAirdrop}>领取ZX币空投</Button>
                            <Button style={{width: '200px',margin: '5px'}} onClick={onBuyToken}>铸造汽车NFT</Button>
                            <Button style={{width: '200px',margin: '5px'}} onClick={onGetMyCars}>查看我的汽车NFT</Button>
                            <Button style={{width: '200px',margin: '5px'}} onClick={onGetUnborrowedCars}>查看可借汽车NFT</Button>
                            <div>
                                汽车TokenId:
                                <input style={{width: '30px',margin: '5px'}} onChange={(e) => setTokenIdToLookUp(e.target.value)}/>
                                <Button style={{width: '150px'}} onClick={onLookUpToken}>查看主人及借用者</Button>
                            </div>
                            <div>
                                汽车TokenId:
                                <input style={{width: '30px',margin: '5px'}} onChange={(e) => setTokenIdToBorrow(e.target.value)}/>
                                借用时间:
                                <input style={{width: '30px',margin: '5px'}} onChange={(e) => setBorrowMinutes(e.target.value)}/>
                                分钟
                                <Button style={{width: '70px',margin: '5px'}} onClick={onBorrowCar}>借用</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='result'>
                <div>
                    {resultFlag === 1 && renderCarList(ownedCars, `你拥有的Token数量为${ownedCars.length}`)}
                    {resultFlag === 2 && renderCarList(unborrowedCars, `当前可借用的Token数量为${unborrowedCars.length}`)}
                    {resultFlag === 3 &&
                        <>
                        <div style={{margin: '5px'}}>拥有者是{carOwner}</div>
                        <div style={{margin: '5px'}}>{carUser === '0x0000000000000000000000000000000000000000' ? '暂无使用者' : '使用者是' + carUser}</div>
                        </>
                    }
                </div>
            </div>
        </>
    )
}

export default CarBorrowPage