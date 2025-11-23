import React from 'react';
import { Business, Category } from '../types';
import BusinessCard from './BusinessCard';

interface BusinessListProps {
    businesses: Business[];
    categories: Category[];
    selectedCategoryId: string | null;
    onViewDetails: (business: Business) => void;
    isSearching?: boolean;
}

// No Results Component
const NoResults: React.FC = () => (
    <div className="flex flex-col items-center text-center p-12 bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-card animate-fadeInUp">
        <span className="text-7xl mb-5">🤔</span>
        <h3 className="text-2xl font-bold text-text-primary">काहीच सापडलं नाही राव!</h3>
        <p className="text-text-secondary mt-2 text-lg">कदाचित स्पेलिंग चुकलं असेल किंवा हे दुकान अजून ॲड झालं नसेल.</p>
        <p className="text-text-secondary text-sm mt-1">दुसरा शब्द टाकून पहा.</p>
    </div>
);

const BusinessList: React.FC<BusinessListProps> = ({ businesses, categories, selectedCategoryId, onViewDetails, isSearching = false }) => {
    if (businesses.length === 0) {
        if (isSearching) {
            return <NoResults />;
        }
        return <NoResults />; 
    }
    
    const renderBusinessCards = (businessList: Business[]) => (
        businessList.map((business, index) => (
            <div key={business.id} className="animate-fadeInUp" style={{ animationDelay: `${index * 50}ms` }}>
                <BusinessCard business={business} onViewDetails={onViewDetails} />
            </div>
        ))
    );

    if (selectedCategoryId || isSearching) {
        return (
            <div className="space-y-4">
                {renderBusinessCards(businesses)}
            </div>
        );
    }

    const groupedBusinesses = businesses.reduce((acc, business) => {
        (acc[business.category] = acc[business.category] || []).push(business);
        return acc;
    }, {} as Record<string, Business[]>);

    const categoryMap = new Map<string, Category>(categories.map(cat => [cat.id, cat]));

    return (
        <div className="space-y-12">
            {Object.keys(groupedBusinesses).map((categoryId, groupIndex) => {
                const businessGroup = groupedBusinesses[categoryId];
                const category = categoryMap.get(categoryId);
                if (!category) return null;
                
                return (
                    <div key={categoryId} className="animate-fadeInUp" style={{ animationDelay: `${groupIndex * 100}ms`}}>
                        <div className="flex items-center gap-4 mb-5 pb-3 border-b-2 border-secondary">
                             <i className={`${category.icon} text-2xl text-secondary`}></i>
                            <h3 className="text-2xl font-bold text-primary">{category.name}</h3>
                        </div>
                        <div className="space-y-4">
                            {renderBusinessCards(businessGroup)}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default BusinessList;
