import React from 'react';

interface Props {
    tokenIds: number[]; // 包含不同tokenId的数组
}

const MyPic: React.FC<Props> = ({ tokenIds }) => {
    return (
        <div>
            {tokenIds.map((tokenId) => (
                <img
                    key={tokenId}
                    src={`../asset/picture${tokenId}.jpg`}
                    alt={`Image ${tokenId}`}
                />
            ))}
        </div>
    );
};

export default MyPic;