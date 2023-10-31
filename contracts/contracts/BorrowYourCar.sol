// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

// Uncomment the line to use openzeppelin/ERC721
// You can use this dependency directly because it has been installed by TA already
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "./ERC4907.sol";
import "./MyERC20.sol";

// Uncomment this line to use console.log
import "hardhat/console.sol";

contract BorrowYourCar is ERC4907{

    // use a event if you want
    // to represent time you can choose block.timestamp
    event CarBorrowed(uint256 carTokenId, address borrower, uint256 startTime, uint256 duration);
    event GetCarOwned(uint256[]);
    event GetCarBorrowed(uint256[]);
    event MintToken(uint256 carTokenId);

    // maybe you need a struct to store car information
    struct Car {
        address owner;
        address borrower;
        uint256 borrowUntil;
    }

    mapping(uint256 => Car) public cars; // A map from car index to its information
    // ...
    // TODO add any variables if you want
    //mapping(address => bool) public carOwner; // A map from car owner to bool
    mapping(address => uint256[]) private carOwned; // A map from car owner to its cars
    uint256 private nextTokenId = 0; // tokenId
    uint256 private costPerToken = 0.01 ether; // price of token
    uint256 private costPerMinute = 1; // one-minute rate
    address private contractOwner;
    MyERC20 public myERC20; // payment token contract

    constructor() ERC4907("ZXNonFungibleToken", "ZXNonFungibleTokenSymbol"){
        // maybe you need a constructor
        myERC20 = new MyERC20("ZXToken", "ZXTokenSymbol");
        contractOwner = msg.sender;
    }

    // ...
    // TODO add any logic if you want
    function mint(uint256 tokenId, address to) public {
        _mint(to, tokenId);
    }

    //get the price of each token
    function getCostPerToken() public view returns (uint256 price) {
        price = costPerToken;
    }

    function getCostPerMinute() public view returns (uint256 price) {
        price = costPerMinute;
    }

    //let the msg.sender become a car owner
    /*function becomeCarOwner() external {
        require(carOwner[msg.sender] == false, "You are already a car owner");
        carOwner[msg.sender] = true;
    }*/

    /*function isCarOwner() public returns (bool) {
        return carOwner[msg.sender];
    }*/

    //msg.sender buy a token using ether
    function mintWithEther() external payable {
        //require(carOwner[msg.sender], "You are not a car owner");
        require(msg.value >= costPerToken, "Insufficient funds sent");
        //mint new NFC
        mint(nextTokenId, msg.sender);
        cars[nextTokenId].owner = msg.sender;
        cars[nextTokenId].borrowUntil = block.timestamp;
        carOwned[msg.sender].push(nextTokenId);

        emit MintToken(nextTokenId);

        nextTokenId++;

        //pay ether to the contract owner
        payable(contractOwner).transfer(costPerToken);
    }

    //get cars the msg.sender owned
    function getCarOwned() public returns (uint256[] memory carsOwned) {
        //require(carOwner[msg.sender], "You are not a car owner");
        carsOwned = carOwned[msg.sender];
        emit GetCarOwned(carsOwned);
    }

    //get all cars that have not been borrowed
    function getUnborrowedCar() public returns (uint256[] memory unBorrowedCars) {
        for(uint256 i = 0;i < nextTokenId;i++){
            if(block.timestamp > cars[i].borrowUntil){
                unBorrowedCars = pushToArray(unBorrowedCars,i);
            }
        }
        emit GetCarBorrowed(unBorrowedCars);
        return unBorrowedCars;
    }

    function pushToArray(uint256[] memory array, uint256 value) internal pure returns (uint256[] memory) {
        uint256[] memory newArray = new uint256[](array.length + 1);
        for (uint256 i = 0; i < array.length; i++) {
            newArray[i] = array[i];
        }
        newArray[array.length] = value;
        return newArray;
    }

    //get the owner of car
    function getCarOwner(uint256 tokenId) public view returns (address owner) {
        require(tokenId < nextTokenId, "This car doesn't exist");
        owner = ownerOf(tokenId);
    }

    //get the user of car
    function getCarUser(uint256 tokenId) public view returns (address user) {
        require(tokenId < nextTokenId, "This car doesn't exist");
        user = userOf(tokenId);
    }

    //borrow a car
    function borrowCar(uint256 tokenId, uint256 _minutes) external {
        require(tokenId < nextTokenId, "This car doesn't exist");
        require(block.timestamp > cars[tokenId].borrowUntil, "This car has been borrowed");

        uint256 expire = _minutes * 60 + block.timestamp;
        uint256 cost = _minutes * costPerMinute;

        require(cost <= myERC20.balanceOf(msg.sender), "Insufficient funds sent");

        setUser(tokenId, msg.sender, uint64(expire));
        cars[tokenId].borrowUntil = expire;
        cars[tokenId].borrower = msg.sender;

        emit CarBorrowed(tokenId,msg.sender,block.timestamp,expire);

        myERC20.transferFrom(msg.sender, ownerOf(tokenId), cost);
    }
    /*
    function helloworld() pure external returns(string memory) {
        return "hello world";
    }*/
}