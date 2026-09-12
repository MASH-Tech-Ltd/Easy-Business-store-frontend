import { useState, useEffect } from 'react';
import { bdLocations } from '@/data/locations';

export interface Division {
  _id: string;
  division: string;
}

export interface District {
  _id: string;
  district: string;
  upazilla: string[];
}

export function useLocationBD(selectedDivision?: string) {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [isLoadingDivisions, setIsLoadingDivisions] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load Divisions
  useEffect(() => {
    setIsLoadingDivisions(true);
    const divs = bdLocations.map(d => ({
      _id: d.division,
      division: d.division
    }));
    setDivisions(divs);
    setIsLoadingDivisions(false);
  }, []);

  // Load Districts when a division is selected
  useEffect(() => {
    if (!selectedDivision) {
      setDistricts([]);
      return;
    }

    setIsLoadingDistricts(true);
    const divData = bdLocations.find(d => d.division.toLowerCase() === selectedDivision.toLowerCase());
    
    if (divData) {
      const dists = divData.districts.map(d => ({
        _id: d.district,
        district: d.district,
        upazilla: d.upazilas
      }));
      setDistricts(dists);
    } else {
      setDistricts([]);
    }
    setIsLoadingDistricts(false);
  }, [selectedDivision]);

  return {
    divisions,
    districts,
    isLoadingDivisions,
    isLoadingDistricts,
    error
  };
}
