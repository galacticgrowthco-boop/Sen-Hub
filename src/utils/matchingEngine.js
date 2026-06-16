import benefitsData from '../data/benefits_2026_27.json';
import localSupportData from '../data/education_and_local_support.json';
import grantsData from '../data/support_and_grants.json';
import charityData from '../data/charity_grants_deep_dive.json';
import localDiscountsData from '../data/local_support_discounts.json';

export const calculateEntitlements = (answers) => {
  const entitlements = [];
  const {
    is_working,
    existing_benefits = [],
    num_children,
    full_time_residence,
    born_before_2017,
    other_adults,
    num_other_adults,
    status,
    housing_costs,
    claimant_condition,
    claimant_affect_work,
    claimant_work_capability,
    claimant_pip,
    hours_care,
    weekly_earnings,
    household_income,
    weekly_childcare_costs,
    commuting_method,
    weekly_miles,
    weekly_transport_costs,
    home_adaptations,
    water_meter
  } = answers;

  const numChildrenNum = parseInt(num_children || 0);
  const numOtherAdultsNum = parseInt(num_other_adults || 0);
  const weeklyEarningsNum = parseFloat(weekly_earnings || 0);
  const householdIncomeNum = parseFloat(household_income || 0);
  const monthlyEarningsNum = weeklyEarningsNum * 52 / 12;
  
  const weeklyChildcareNum = parseFloat(weekly_childcare_costs || 0);
  const monthlyChildcareNum = weeklyChildcareNum * 52 / 12;
  
  let weeklyCommutingNum = 0;
  if (commuting_method === 'driving') {
    weeklyCommutingNum = parseFloat(weekly_miles || 0) * 0.45;
  } else {
    weeklyCommutingNum = parseFloat(weekly_transport_costs || 0);
  }
  const monthlyCommutingNum = weeklyCommutingNum * 52 / 12;

  const hasExistingUC = existing_benefits.includes('universal_credit');
  const hasExistingCB = existing_benefits.includes('child_benefit');
  const hasExistingCA = existing_benefits.includes('carers_allowance');

  // Process children data
  const children = [];
  for (let i = 1; i <= numChildrenNum; i++) {
    children.push({
      age: parseInt(answers[`child_${i}_age`] || 0),
      care: answers[`child_${i}_care`],
      mobility: answers[`child_${i}_mobility`],
      diagnosis: answers[`child_${i}_diagnosis`],
      ehcp: answers[`child_${i}_ehcp`],
      existing_dla: answers[`child_${i}_existing_dla`] === 'yes'
    });
  }

  // 1. DLA / PIP for Children
  let totalMonthlyDisability = 0;
  children.forEach((child, index) => {
    if (child.age < 16 && (child.care === 'yes' || child.mobility === 'yes')) {
      const dla = benefitsData.benefits.dla_children;
      const weekly = (child.care === 'yes' ? dla.rates.care.middle : 0) + 
                     (child.mobility === 'yes' ? dla.rates.mobility.lower : 0);
      
      if (weekly > 0) {
        const monthly = weekly * 52 / 12;
        totalMonthlyDisability += monthly;
        
        let likelihood = 'potential';
        if (child.existing_dla) likelihood = 'active';
        else if (child.diagnosis === 'yes') likelihood = 'likely';
        
        entitlements.push({
          id: `dla_child_${index+1}`,
          name: `DLA for Child ${index+1}`,
          category: 'Benefits',
          amount: `£${weekly.toFixed(2)}`,
          period: 'weekly',
          status: likelihood,
          description: child.existing_dla 
            ? `You are already receiving this support for child ${index+1}.`
            : `Estimated based on reported needs for child ${index+1}. ${child.diagnosis === 'yes' ? 'Formal diagnosis strongly supports this claim.' : child.diagnosis === 'in_process' ? 'Being in the diagnosis process supports your application.' : ''}`,
          official_url: dla.official_url
        });
      }
    } else if (child.age >= 16) {
      const pip = benefitsData.benefits.pip;
      const weekly = (child.care === 'yes' ? pip.rates.daily_living.standard : 0) + 
                     (child.mobility === 'yes' ? pip.rates.mobility.standard : 0);
      
      if (weekly > 0) {
        const monthly = weekly * 52 / 12;
        totalMonthlyDisability += monthly;
        
        let likelihood = 'check';
        if (child.existing_dla) likelihood = 'active'; // PIP is same for 16+
        else if (child.diagnosis === 'yes') likelihood = 'likely';

        entitlements.push({
          id: `pip_child_${index+1}`,
          name: `PIP for Child ${index+1}`,
          category: 'Benefits',
          amount: `£${weekly.toFixed(2)}`,
          period: 'weekly',
          status: likelihood,
          description: child.existing_dla 
            ? `You are already receiving this support for child ${index+1}.`
            : `Personal Independence Payment for child ${index+1} (16+).`,
          official_url: pip.official_url
        });
      }
    }
  });

  // 2. Child Benefit
  let weeklyChildBenefit = 0;
  if (numChildrenNum > 0) {
    const cb = benefitsData.benefits.child_benefit;
    weeklyChildBenefit = cb.rates.eldest_or_only_child + (cb.rates.additional_children * (numChildrenNum - 1));
    
    entitlements.push({
      id: 'child_benefit',
      name: "Child Benefit",
      category: 'Benefits',
      amount: `£${weeklyChildBenefit.toFixed(2)}`,
      period: 'weekly',
      status: hasExistingCB ? 'active' : (householdIncomeNum < 60000) ? 'likely' : 'check',
      description: hasExistingCB 
        ? "You are already receiving Child Benefit."
        : `Support for families with children. Fully available if individual income is under £60,000.`,
      official_url: cb.official_url
    });
  }
  const monthlyChildBenefit = weeklyChildBenefit * 52 / 12;

  // 3. Carer's Allowance
  const ca = benefitsData.benefits.carers_allowance;
  let monthlyCA = 0;
  if (hours_care === 'more_35') {
    const isUnderEarningsLimit = is_working === 'no' || weeklyEarningsNum <= ca.eligibility_rules.max_earnings_per_week_after_tax_ni_expenses;
    const hasSENCategory = children.some(c => c.care === 'yes' || c.existing_dla);
    
    if (isUnderEarningsLimit) {
      monthlyCA = ca.rate * 52 / 12;
      entitlements.push({
        id: 'carers_allowance',
        name: ca.name,
        category: 'Benefits',
        amount: `£${ca.rate.toFixed(2)}`,
        period: ca.frequency,
        status: hasExistingCA ? 'active' : (hasSENCategory ? 'likely' : 'potential'),
        description: hasExistingCA
          ? "You are already receiving Carer's Allowance."
          : `Requires the child you care for to receive DLA (middle/high care) or PIP (daily living).`,
        official_url: ca.official_url,
        warning: ca.cliff_edge_warning
      });
    }
  }

  // 4. Claimant Health / PIP
  let monthlyClaimantDisability = 0;
  if (claimant_pip === 'yes') {
    const pip = benefitsData.benefits.pip;
    monthlyClaimantDisability = (pip.rates.daily_living.standard + pip.rates.mobility.standard) * 52 / 12;
    entitlements.push({
      id: 'claimant_pip_active',
      name: "Your Personal Independence Payment",
      category: 'Benefits',
      status: 'active',
      description: "You are already receiving support for your own health needs."
    });
  } else if (claimant_condition === 'yes') {
    entitlements.push({
      id: 'claimant_pip_potential',
      name: "PIP for Yourself",
      category: 'Benefits',
      status: 'check',
      description: "Based on your health condition, you may be entitled to PIP for yourself.",
      official_url: benefitsData.benefits.pip.official_url
    });
  }

  // 5. Universal Credit
  const uc = benefitsData.benefits.universal_credit;
  let ucElements = 0;
  const ucBreakdown = [];

  // Standard Allowance
  if (status === 'single') {
    const amt = 424.90;
    ucElements += amt;
    ucBreakdown.push(`Standard Allowance (Single 25+): £${amt.toFixed(2)}`);
  } else {
    const amt = 666.97;
    ucElements += amt;
    ucBreakdown.push(`Standard Allowance (Couple): £${amt.toFixed(2)}`);
  }

  // Child Elements
  const residenceFactor = full_time_residence === 'shared' ? 0.5 : 1.0;
  let childElementBase = uc.child_elements.per_child * Math.min(numChildrenNum, 2); // 2 child limit usually
  if (numChildrenNum > 2) {
     // Check for 2-child limit exceptions would go here, but using 2 as default for now
  }

  if (born_before_2017 === 'yes') {
    childElementBase += uc.child_elements.first_child_born_before_apr_2017_addition;
    ucBreakdown.push(`Child Elements (incl. Pre-2017): £${(childElementBase * residenceFactor).toFixed(2)}`);
  } else {
    ucBreakdown.push(`Child Elements: £${(childElementBase * residenceFactor).toFixed(2)}`);
  }
  ucElements += (childElementBase * residenceFactor);

  // Disabled Child Additions
  let disabledChildAdditionTotal = 0;
  children.forEach(child => {
    if (child.care === 'yes' || child.mobility === 'yes' || child.existing_dla) {
      const rate = (child.care === 'yes' || child.existing_dla) ? uc.disabled_child_additions.higher_rate : uc.disabled_child_additions.lower_rate;
      disabledChildAdditionTotal += rate;
    }
  });
  if (disabledChildAdditionTotal > 0) {
    ucBreakdown.push(`Disabled Child Additions: £${(disabledChildAdditionTotal * residenceFactor).toFixed(2)}`);
  }
  ucElements += (disabledChildAdditionTotal * residenceFactor);

  // Carer Element
  if (hours_care === 'more_35') {
    ucElements += uc.carer_element;
    ucBreakdown.push(`Carer Element: £${uc.carer_element.toFixed(2)}`);
  }

  // Health Element
  let hasHealthElement = false;
  if (claimant_work_capability === 'lcwra') {
    ucElements += uc.lcwra_element;
    ucBreakdown.push(`LCWRA Element: £${uc.lcwra_element.toFixed(2)}`);
    hasHealthElement = true;
  } else if (claimant_work_capability === 'lcw') {
    ucElements += uc.lcw_element;
    ucBreakdown.push(`LCW Element: £${uc.lcw_element.toFixed(2)}`);
    hasHealthElement = true;
  }

  // Childcare Element
  const childcareCap = numChildrenNum > 1 ? uc.childcare_max_monthly.two_or_more_children : uc.childcare_max_monthly.one_child;
  const ucChildcareElement = Math.min(monthlyChildcareNum * uc.childcare_costs_rebate, childcareCap);
  
  // Non-dependant Deductions
  let totalNonDepDeduction = 0;
  if (housing_costs === 'yes' && other_adults === 'yes') {
    totalNonDepDeduction = numOtherAdultsNum * 85.73;
    ucBreakdown.push(`Non-dependant Deduction: -£${totalNonDepDeduction.toFixed(2)}`);
  }

  // Work Allowance
  const hasWorkAllowanceEligibility = numChildrenNum > 0 || hasHealthElement || (claimant_condition === 'yes' && claimant_affect_work !== 'no');
  const workAllowance = hasWorkAllowanceEligibility 
    ? (housing_costs === 'yes' ? uc.work_allowance.with_housing_help : uc.work_allowance.without_housing_help)
    : 0;
  
  if (workAllowance > 0) {
    ucBreakdown.push(`Work Allowance (Earnings ignored): £${workAllowance.toFixed(2)}`);
  }

  const calculateUCForEarnings = (earnings) => {
    const excessEarnings = Math.max(0, earnings - workAllowance);
    const taperDeduction = excessEarnings * uc.taper_rate;
    // Carer's Allowance is deducted £1 for £1
    const caDeduction = earnings > 0 ? (hours_care === 'more_35' && (earnings / (52/12)) <= ca.eligibility_rules.max_earnings_per_week_after_tax_ni_expenses ? monthlyCA : 0) : monthlyCA;
    
    let total = ucElements - taperDeduction - caDeduction - totalNonDepDeduction;
    if (is_working === 'yes' && earnings === monthlyEarningsNum) {
      total += ucChildcareElement;
    }
    return Math.max(0, total);
  };

  const estimatedUCWorking = calculateUCForEarnings(monthlyEarningsNum);
  const estimatedUCNotWorking = calculateUCForEarnings(0);

  entitlements.push({
    id: 'universal_credit',
    name: "Universal Credit (Estimated)",
    category: 'Benefits',
    amount: `£${(is_working === 'yes' ? estimatedUCWorking : estimatedUCNotWorking).toFixed(2)}`,
    period: uc.frequency,
    status: hasExistingUC ? 'active' : 'check',
    description: hasExistingUC ? "Current estimated award." : `Includes standard allowance, child elements, and any health/SEN additions.`,
    official_url: uc.official_url,
    details: ucBreakdown
  });

  // 6. Better-off Comparison
  const annualEarnings = weeklyEarningsNum * 52;
  const taxableIncome = Math.max(0, annualEarnings - 12570);
  const estTaxNI = (taxableIncome * 0.28) / 12;

  const totalFixedBenefits = monthlyChildBenefit + totalMonthlyDisability + monthlyClaimantDisability;

  const workingNet = monthlyEarningsNum + estimatedUCWorking + totalFixedBenefits + (monthlyEarningsNum > 0 && weeklyEarningsNum <= ca.eligibility_rules.max_earnings_per_week_after_tax_ni_expenses ? monthlyCA : 0) - (monthlyChildcareNum + monthlyCommutingNum + estTaxNI);
  
  const notWorkingNet = estimatedUCNotWorking + totalFixedBenefits + monthlyCA;

  const comparison = {
    working: {
      earnings: monthlyEarningsNum,
      benefits: estimatedUCWorking + totalFixedBenefits + (weeklyEarningsNum <= ca.eligibility_rules.max_earnings_per_week_after_tax_ni_expenses ? monthlyCA : 0),
      costs: monthlyChildcareNum + monthlyCommutingNum + estTaxNI,
      tax: estTaxNI,
      childcare: monthlyChildcareNum,
      childcareRebate: ucChildcareElement,
      commute: monthlyCommutingNum,
      net: workingNet
    },
    notWorking: {
      earnings: 0,
      benefits: estimatedUCNotWorking + totalFixedBenefits + monthlyCA,
      costs: 0,
      net: notWorkingNet
    },
    showComparison: is_working === 'yes' || householdIncomeNum > 0 || claimant_condition === 'yes'
  };

  // 7. Education Support
  const ed = localSupportData.education_support;
  const hasUC = hasExistingUC || estimatedUCNotWorking > 0 || estimatedUCWorking > 0;

  children.forEach((child, index) => {
    // FSM
    const isUniversalFSM = child.age >= 4 && child.age <= 7;
    const isMeansTestedFSM = hasUC && householdIncomeNum < ed.free_school_meals.eligibility_criteria.universal_credit_threshold;
    
    if (isUniversalFSM || isMeansTestedFSM) {
      entitlements.push({
        id: `fsm_child_${index+1}`,
        name: `${ed.free_school_meals.name} (Child ${index+1})`,
        category: 'Education Support',
        status: isUniversalFSM ? 'info' : 'likely',
        description: isUniversalFSM ? ed.free_school_meals.infant_fsm : `Based on your household income and UC status, your child qualifies for Free School Meals.`,
        official_url: 'https://www.gov.uk/apply-free-school-meals'
      });

      // Pupil Premium
      const ppAmount = child.age <= 11 ? ed.pupil_premium.rates_2026_27.primary_fsm_ever_6 : ed.pupil_premium.rates_2026_27.secondary_fsm_ever_6;
      entitlements.push({
        id: `pupil_premium_child_${index+1}`,
        name: `${ed.pupil_premium.name} (Child ${index+1})`,
        category: 'Education Support',
        status: 'info',
        description: `Your school receives £${ppAmount} extra funding to support your child because they qualify for FSM. Use this as leverage for extra support!`,
        official_url: 'https://www.gov.uk/government/publications/pupil-premium/pupil-premium'
      });
    }

    // EHCP
    if (child.ehcp === 'yes' || child.ehcp === 'in_process') {
      entitlements.push({
        id: `ehcp_child_${index+1}`,
        name: `EHCP (Child ${index+1})`,
        category: 'Education Support',
        status: child.ehcp === 'yes' ? 'active' : 'check',
        description: child.ehcp === 'yes' ? "Active Education, Health and Care Plan." : "EHCP assessment process is underway.",
        gateway_to: ed.ehcp.gateway_to
      });
    } else if (child.care === 'yes' || child.mobility === 'yes' || child.diagnosis === 'yes') {
      entitlements.push({
        id: `ehcp_potential_child_${index+1}`,
        name: `EHCP Support (Child ${index+1})`,
        category: 'Education Support',
        status: 'check',
        description: "Based on your child's needs, they may benefit from an EHCP. This secures legal rights to specialist support.",
        official_url: 'https://www.ipsea.org.uk/pages/category/education-health-and-care-plans'
      });
    }

    // Home to School Transport
    if (child.ehcp === 'yes' && child.age >= 5) {
      entitlements.push({
        id: `transport_child_${index+1}`,
        name: ed.home_to_school_transport.name,
        category: 'Education Support',
        status: 'check',
        description: "Children with an EHCP often qualify for free home-to-school transport if they cannot walk to school because of their SEN.",
        official_url: 'https://www.gov.uk/help-home-school-transport'
      });
    }
  });

  // 8. Local Discounts
  const ld = localDiscountsData;
  if (hasUC || householdIncomeNum < 16000) {
    entitlements.push({
      id: 'ctr',
      ...ld.council_tax.council_tax_reduction,
      category: 'Benefits',
      status: 'likely'
    });
  }

  // 9. Charity Grants
  charityData.charity_grants.forEach((charity, index) => {
    let isEligible = false;
    let status = 'potential';

    if (charity.charity_name === 'Family Fund') {
      if (householdIncomeNum < 35000) {
        isEligible = true;
        status = children.some(c => c.diagnosis === 'yes' || c.existing_dla) ? 'likely' : 'potential';
      }
    } else if (charity.charity_name === 'Newlife the Charity for Disabled Children') {
      if (children.some(c => c.age < 19 && (c.care === 'yes' || c.mobility === 'yes' || c.diagnosis === 'yes' || c.existing_dla))) {
        isEligible = true;
      }
    } else if (charity.charity_name === 'Turn2Us' || charity.charity_name === 'Contact') {
      isEligible = true;
      status = 'info';
    }

    if (isEligible) {
      entitlements.push({
        id: `charity_${index}`,
        name: charity.charity_name,
        category: 'Grants',
        status: status,
        description: charity.grant_types ? `Can provide help with: ${charity.grant_types.join(', ')}` : charity.eligibility_rules?.description || 'Information and advice on grants.',
        official_url: charity.official_url
      });
    }
  });

  return { entitlements, comparison };
};
