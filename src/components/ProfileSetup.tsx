import React, { useState } from 'react';
import { updateUserProfile } from '../lib/chat';
import { UserProfile } from '../types/chat';
import { getInvestmentRecommendation } from '../lib/market';

interface ProfileSetupProps {
  userId: string;
  onComplete: () => void;
}

export default function ProfileSetup({ userId, onComplete }: ProfileSetupProps) {
  const [profile, setProfile] = useState({
    risk_tolerance: 'moderate' as const,
    retirement_goal: 1000000,
    current_age: 30,
    target_retirement_age: 65,
    monthly_contribution: 1000,
  });
  const [showSummary, setShowSummary] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (profile.target_retirement_age <= profile.current_age) {
      setError("Target retirement age must be greater than current age.");
      setIsSubmitting(false);
      return;
    }

    try {
      const profileData: UserProfile = {
        id: userId,
        ...profile,
        current_portfolio: {
          stocks: 0,
          bonds: 0,
          cash: 0
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await updateUserProfile(userId, profileData);
      setShowSummary(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile. Please try again.');
      console.error('Error saving profile:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const recommendation = getInvestmentRecommendation(
    profile.risk_tolerance,
    profile.current_age
  );

  if (showSummary) {
    const yearsToRetirement = profile.target_retirement_age - profile.current_age;
    const monthlyContributionYearly = profile.monthly_contribution * 12;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full p-6">
          <h2 className="text-2xl font-bold mb-6">Profile Saved Successfully! 🎉</h2>
          
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Your Investment Profile</h3>
              <ul className="space-y-2">
                <li><span className="font-medium">Risk Tolerance:</span> {profile.risk_tolerance.charAt(0).toUpperCase() + profile.risk_tolerance.slice(1)}</li>
                <li><span className="font-medium">Current Age:</span> {profile.current_age}</li>
                <li><span className="font-medium">Target Retirement Age:</span> {profile.target_retirement_age}</li>
                <li><span className="font-medium">Years to Retirement:</span> {yearsToRetirement}</li>
                <li><span className="font-medium">Monthly Contribution:</span> ${profile.monthly_contribution.toLocaleString()}</li>
                <li><span className="font-medium">Yearly Contribution:</span> ${monthlyContributionYearly.toLocaleString()}</li>
                <li><span className="font-medium">Retirement Goal:</span> ${profile.retirement_goal.toLocaleString()}</li>
              </ul>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Recommended Portfolio Allocation</h3>
              <ul className="space-y-2">
                <li><span className="font-medium">Stocks:</span> {recommendation.stocks}%</li>
                <li><span className="font-medium">Bonds:</span> {recommendation.bonds}%</li>
                <li><span className="font-medium">Cash:</span> {recommendation.cash}%</li>
              </ul>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Next Steps</h3>
              <p>Based on your profile, here are some suggestions:</p>
              <ul className="list-disc ml-4 mt-2 space-y-1">
                <li>Start with the recommended portfolio allocation</li>
                <li>Review and rebalance your portfolio quarterly</li>
                <li>Consider increasing contributions as your income grows</li>
                <li>Chat with our advisor for more specific guidance</li>
              </ul>
            </div>
          </div>

          <button
            onClick={onComplete}
            className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Start Chatting with Advisor
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-6">Set Up Your Profile</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Risk Tolerance
            </label>
            <select
              value={profile.risk_tolerance}
              onChange={(e) => setProfile(p => ({ ...p, risk_tolerance: e.target.value as 'low' | 'moderate' | 'high' }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              <option value="low">Low</option>
              <option value="moderate">Moderate</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Retirement Goal ($)
            </label>
            <input
              type="number"
              value={profile.retirement_goal}
              onChange={(e) => setProfile(p => ({ ...p, retirement_goal: Number(e.target.value) }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              min="0"
              step="10000"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Current Age
            </label>
            <input
              type="number"
              value={profile.current_age}
              onChange={(e) => setProfile(p => ({ ...p, current_age: Number(e.target.value) }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              min="18"
              max="100"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Target Retirement Age
            </label>
            <input
              type="number"
              value={profile.target_retirement_age}
              onChange={(e) => setProfile(p => ({ ...p, target_retirement_age: Number(e.target.value) }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              min="1"
              max="100"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Monthly Contribution ($)
            </label>
            <input
              type="number"
              value={profile.monthly_contribution}
              onChange={(e) => setProfile(p => ({ ...p, monthly_contribution: Number(e.target.value) }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              min="0"
              step="100"
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}