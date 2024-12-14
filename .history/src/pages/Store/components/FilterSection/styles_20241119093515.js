// src/pages/store/components/FilterSection/styles.js
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

export const FilterContainer = styled(motion.div)`
  padding: 1.5rem;
  background: #0a0f16;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

export const FilterGroup = styled(motion.div)`
  margin-bottom: 2rem;
`;

export const FilterTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #1a2030;
`;

export const FilterList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const FilterItem = styled(motion.label)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  transition: background-color 0.2s;
  cursor: pointer;

  &:hover {
    background-color: #141b26;
  }
`;

export const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

export const HiddenInput = styled.input`
  display: none;
`;

export const CustomCheckbox = styled(motion.div)`
  width: 20px;
  height: 20px;
  border: 2px solid ${props => props.checked ? '#3b82f6' : '#2a3441'};
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  background-color: ${props => props.checked ? '#3b82f6' : 'transparent'};
`;

export const CheckboxInner = styled(motion.div)`
  width: 12px;
  height: 12px;
  background: #ffffff;
  border-radius: 2px;
`;

export const Label = styled.span`
  font-size: 0.938rem;
  color: #9ca3af;
`;

export const Count = styled.span`
  font-size: 0.813rem;
  color: #9ca3af;
  background: #141b26;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
`;

export const TagsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.75rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
`;

export const TagButton = styled(motion.button)`
  padding: 0.5rem 1rem;
  border: 1px solid ${props => props.active ? '#3b82f6' : '#1a2030'};
  border-radius: 8px;
  font-size: 0.875rem;
  color: ${props => props.active ? '#ffffff' : '#9ca3af'};
  background: ${props => props.active ? '#3b82f6' : '#0a0f16'};
  transition: all 0.2s;
  cursor: pointer;
  text-align: center;

  &:hover {
    background-color: ${props => props.active ? '#3b82f6' : '#141b26'};
  }
`;

