import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import React, { ReactNode } from 'react';

interface CardDataStatsProps {
  title: string;
  total: string; 
  children: ReactNode;
}

const CardDataStatsTypeTwo: React.FC<CardDataStatsProps> = ({
  title,
  total, 
  children,
}) => {
  return (
    <div className="rounded-3xl border border-stroke bg-white p-2 ps-5 pe-3 shadow-default dark:border-strokedark dark:bg-boxdark flex justify-between">
      <div className="flex items-end justify-between">
        <div>
          <h4 className="text-[34px] m-0 font-black text-[#9a4bff]">
            {+total < 10 ? `0${total}` : total}
          </h4>
          <span className="text-[14px] font-medium text-black">{title}</span>
        </div>
      </div>
      <div className="flex justify-center items-center h-[60px] w-[60px] rounded-full bg-[#F0E4FF] dark:bg-meta-4">
        {children}
      </div>

    </div>
  );
};

export default CardDataStatsTypeTwo;
