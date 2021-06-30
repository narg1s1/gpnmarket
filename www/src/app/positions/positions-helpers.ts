import { Request } from 'src/app/request/common/models/request';
import { RequestPosition } from './../request/common/models/request-position';

export const getFlatPositions = (positions: RequestPosition[]) => {
  return positions?.reduce((acc, position: RequestPosition) => {
    if (position.positions) {
      return acc.concat(position.positions);
    } else {
      acc.push(position);
      return acc;
    }
  }, []);
};

export const searchGroups = (query: string, groups: Request[]) => {
  return query
    ? groups.filter(group => group.name.toLowerCase().includes(query?.toLowerCase()))
    : groups;
};
