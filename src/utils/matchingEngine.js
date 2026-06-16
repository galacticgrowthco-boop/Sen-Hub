import benefitsData from '../data/benefits_2026_27.json';
import localSupportData from '../data/education_and_local_support.json';
import grantsData from '../data/support_and_grants.json';
import charityData from '../data/charity_grants_deep_dive.json';
import localDiscountsData from '../data/local_support_discounts.json';

export const calculateEntitlements = (answers) => {
  const entitlements = [];
  const {
    is_working,
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

  // Process children data
  const children = [];
  for (let i = 1; i <= numChildrenNum; i++) {
    children.push({
      age: parseInt(answers[`child_${i}_age`] || 0),
      care: answers[`child_${i}_care`],
      mobility: answers[`child_${i}_mobility`],
      diagnosis: answers[`child_${i}_diagnosis`]
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
        
        // Elevate status to 'likely' if there is a diagnosis
        const likelihood = child.diagnosis === 'yes' ? 'likely' : 'potential';
        
        entitlements.push({
          id: `dla_child_${index+1}`,
          name: `DLA for Child ${index+1}`,
          category: 'Benefits',
          amount: `£${weekly.toFixed(2)}`,
          period: 'weekly',
          status: likelihood,
          description: `Estimated based on reported needs for child ${index+1}. ${child.diagnosis === 'yes' ? 'Formal diagnosis strongly supports this claim.' : child.diagnosis === 'in_process' ? 'Being in the diagnosis process supports your application.' : ''}`,
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
        
        const likelihood = child.diagnosis === 'yes' ? 'likely' : 'check';

        entitlements.push({
          id: `pip_child_${index+1}`,
          name: `PIP for Child ${index+1}`,
          category: 'Benefits',
          amount: `£${weekly.toFixed(2)}`,
          period: 'weekly',
          status: likelihood,
          description: `Personal Independence Payment for child ${index+1} (16+).`,
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
      status: (householdIncomeNum < 60000) ? 'likely' : 'check',
      description: `Support for families with children. Fully available if individual income is under £60,000.`,
      official_url: cb.official_url
    });
  }
  const monthlyChildBenefit = weeklyChildBenefit * 52 / 12;

  // 3. Carer's Allowance
  const ca = benefitsData.benefits.carers_allowance;
  let monthlyCA = 0;
  if (hours_care === 'more_35') {
    const isUnderEarningsLimit = is_working === 'no' || weeklyEarningsNum <= ca.eligibility_rules.max_earnings_per_week_after_tax_ni_expenses;
    const hasSENCategory = children.some(c => c.care === 'yes');
    
    if (isUnderEarningsLimit) {
      monthlyCA = ca.rate * 52 / 12;
      entitlements.push({
        id: 'carers_allowance',
        name: ca.name,
        category: 'Benefits',
        amount: `£${ca.rate.toFixed(2)}`,
        period: ca.frequency,
        status: hasSENCategory ? 'likely' : 'potential',
        description: `Requires the child you care for to receive DLA (middle/high care) or PIP (daily living).`,
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
      status: 'likely',
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

  // Standard Allowance
  if (status === 'single') {
    ucElements += 424.90; // single 25+
  } else {
    ucElements += 666.97; // couple
  }

  // Child Elements
  const residenceFactor = full_time_residence === 'shared' ? 0.5 : 1.0;
  let childElementBase = uc.child_elements.per_child * numChildrenNum;
  if (born_before_2017 === 'yes') {
    childElementBase += uc.child_elements.first_child_born_before_apr_2017_addition;
  }
  ucElements += (childElementBase * residenceFactor);

  // Disabled Child Additions
  let disabledChildAdditionTotal = 0;
  children.forEach(child => {
    if (child.care === 'yes' || child.mobility === 'yes') {
      const rate = child.care === 'yes' ? uc.disabled_child_additions.higher_rate : uc.disabled_child_additions.lower_rate;
      disabledChildAdditionTotal += rate;
    }
  });
  ucElements += (disabledChildAdditionTotal * residenceFactor);

  // Carer Element
  if (hours_care === 'more_35') {
    ucElements += uc.carer_element;
  }

  // Health Element
  let hasHealthElement = false;
  if (claimant_work_capability === 'lcwra') {
    ucElements += uc.lcwra_element;
    hasHealthElement = true;
  } else if (claimant_work_capability === 'lcw') {
    ucElements += uc.lcw_element;
    hasHealthElement = true;
  } else if (claimant_condition === 'yes' && claimant_affect_work === 'yes') {
    // Estimate potential LCWRA if they say it affects work significantly
    entitlements.push({
      id: 'uc_health_element_potential',
      name: "UC Health Element (Potential)",
      category: 'Benefits',
      status: 'check',
      description: "If your condition affects your ability to work, you may qualify for the LCWRA element (£429.80/mo)."
    });
  }

  // Childcare Element
  const childcareCap = numChildrenNum > 1 ? uc.childcare_max_monthly.two_or_more_children : uc.childcare_max_monthly.one_child;
  const ucChildcareElement = Math.min(monthlyChildcareNum * uc.childcare_costs_rebate, childcareCap);
  if (is_working === 'yes') {
    ucElements += ucChildcareElement;
  }

  // Non-dependant Deductions
  let totalNonDepDeduction = 0;
  if (housing_costs === 'yes' && other_adults === 'yes') {
    // Use the 2026-27 minimum working deduction as a baseline
    totalNonDepDeduction = numOtherAdultsNum * 85.73;
  }

  // Work Allowance
  // You get a work allowance if you have children OR a health condition that affects work
  const hasWorkAllowanceEligibility = numChildrenNum > 0 || hasHealthElement || (claimant_condition === 'yes' && claimant_affect_work !== 'no');
  const workAllowance = hasWorkAllowanceEligibility 
    ? (housing_costs === 'yes' ? uc.work_allowance.with_housing_help : uc.work_allowance.without_housing_help)
    : 0;
  
  const calculateUCForEarnings = (earnings) => {
    const excessEarnings = Math.max(0, earnings - workAllowance);
    const taperDeduction = excessEarnings * uc.taper_rate;
    const caDeduction = earnings > 0 ? (hours_care === 'more_35' && earnings/ (52/12) <= ca.eligibility_rules.max_earnings_per_week_after_tax_ni_expenses ? monthlyCA : 0) : monthlyCA;
    
    return Math.max(0, ucElements - taperDeduction - caDeduction - totalNonDepDeduction);
  };

  const estimatedUCWorking = calculateUCForEarnings(monthlyEarningsNum);
  const estimatedUCNotWorking = calculateUCForEarnings(0);

  const hasUniversalCredit = estimatedUCNotWorking > 0 || estimatedUCWorking > 0;

  entitlements.push({
    id: 'universal_credit',
    name: "Universal Credit (Estimated)",
    category: 'Benefits',
    amount: `£${(is_working === 'yes' ? estimatedUCWorking : estimatedUCNotWorking).toFixed(2)}`,
    period: uc.frequency,
    status: 'check',
    description: `Includes standard allowance, child elements, and any health/SEN additions.`,
    official_url: uc.official_url,
    details: [
      `Base Elements: £${(ucElements - ucChildcareElement).toFixed(2)}`,
      `Childcare Help: £${(is_working === 'yes' ? ucChildcareElement : 0).toFixed(2)}`,
      `Non-Dep Deduction: -£${totalNonDepDeduction.toFixed(2)}`,
      `Work Allowance: £${workAllowance.toFixed(2)}`
    ]
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
  children.forEach((child, index) => {
    // FSM
    const isUniversalFSM = child.age >= 4 && child.age <= 7;
    const isMeansTestedFSM = hasUniversalCredit && householdIncomeNum < ed.free_school_meals.eligibility_criteria.universal_credit_threshold;
    
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
        description: `Your school receives £${ppAmount} extra funding to support your child because they qualify for FSM. Use this as a leverage for extra support!`,
        official_url: 'https://www.gov.uk/government/publications/pupil-premium/pupil-premium'
      });
      
      // HAF
      entitlements.push({
        id: `haf_child_${index+1}`,
        name: ed.holiday_activity_and_food_programme.name,
        category: 'Education Support',
        status: 'info',
        description: ed.holiday_activity_and_food_programme.description,
        official_url: 'https://www.gov.uk/government/publications/holiday-activities-and-food-programme/holiday-activities-and-food-programme-2024'
      });
    } else if (child.age > 7) {
      entitlements.push({
        id: `fsm_child_${index+1}_potential`,
        name: `${ed.free_school_meals.name} (Child ${index+1})`,
        category: 'Education Support',
        status: 'check',
        description: `Your child may qualify for Free School Meals if you are on qualifying benefits and your household income from work is below £${ed.free_school_meals.eligibility_criteria.universal_credit_threshold}.`,
        official_url: 'https://www.gov.uk/apply-free-school-meals'
      });
    }

    // EHCP / SEN Budget
    if (child.diagnosis === 'yes' || child.care === 'yes' || child.mobility === 'yes') {
      entitlements.push({
        id: `ehcp_child_${index+1}`,
        name: ed.ehcp.name,
        category: 'Education Support',
        status: child.diagnosis === 'yes' ? 'likely' : 'check',
        description: ed.ehcp.description,
        gateway_to: ed.ehcp.gateway_to
      });

      entitlements.push({
        id: `sen_budget_child_${index+1}`,
        name: "Notional SEN Budget",
        category: 'Education Support',
        status: 'info',
        description: ed.sen_school_funding.notional_sen_budget.description
      });
      
      entitlements.push({
        id: `top_up_funding_child_${index+1}`,
        name: ed.sen_school_funding.top_up_funding.name,
        category: 'Education Support',
        status: 'info',
        description: ed.sen_school_funding.top_up_funding.description
      });
      
      entitlements.push({
        id: `transport_child_${index+1}`,
        name: ed.home_to_school_transport.name,
        category: 'Education Support',
        status: 'check',
        description: ed.home_to_school_transport.support,
        official_url: 'https://www.gov.uk/help-home-school-transport'
      });
    }

    // 16-19 Bursary
    if (child.age >= 16 && child.age <= 19 && (child.care === 'yes' || child.mobility === 'yes')) {
      entitlements.push({
        id: `bursary_child_${index+1}`,
        name: ed["16_19_bursary_fund"].name,
        category: 'Education Support',
        status: 'likely',
        description: ed["16_19_bursary_fund"].types.vulnerable_student_bursary.amount + ". For students receiving DLA/PIP and Universal Credit or ESA.",
        official_url: 'https://www.gov.uk/1619-bursary-fund'
      });
    }

    // Early Years Support (3-4 years old)
    if (child.age >= 3 && child.age <= 4) {
      if (child.care === 'yes' || child.mobility === 'yes') {
        entitlements.push({
          id: `daf_child_${index+1}`,
          name: ed.early_years_support.disability_access_fund.name,
          category: 'Education Support',
          status: 'info',
          description: `£${ed.early_years_support.disability_access_fund.amount_2026_27} per year. For children receiving DLA and the free childcare entitlement.`,
          official_url: 'https://www.gov.uk/disability-access-fund'
        });
      }
      if (isMeansTestedFSM) {
        entitlements.push({
          id: `eypp_child_${index+1}`,
          name: ed.early_years_support.early_years_pupil_premium.name,
          category: 'Education Support',
          status: 'info',
          description: `£${ed.early_years_support.early_years_pupil_premium.amount_2026_27} per year extra for your childcare provider.`,
          official_url: 'https://www.gov.uk/early-years-pupil-premium'
        });
      }
    }

    // School Uniform Grant
    if (isMeansTestedFSM) {
       entitlements.push({
        id: `uniform_grant_child_${index+1}`,
        name: ed.school_uniform_grant.name,
        category: 'Education Support',
        status: 'check',
        description: ed.school_uniform_grant.description + " " + ed.school_uniform_grant.note,
        official_url: 'https://www.gov.uk/help-school-clothing-costs'
      });
    }
  });

  // Local Authority Schemes
  const la = localSupportData.local_authority_schemes;
  if (children.some(c => c.care === 'yes' || c.mobility === 'yes')) {
    entitlements.push({
      id: 'short_breaks',
      name: la.short_breaks.name,
      category: 'Education Support',
      status: 'check',
      description: la.short_breaks.description
    });
    entitlements.push({
      id: 'max_card',
      name: la.max_card.name,
      category: 'Education Support',
      status: 'likely',
      description: la.max_card.description,
      official_url: 'https://www.mymaxcard.co.uk/'
    });
  }

  // 8. Local Discounts (Council Tax & More)
  const ld = localDiscountsData;
  
  // Council Tax Reduction
  if (hasUniversalCredit || householdIncomeNum < 16000) {
    entitlements.push({
      id: 'ctr',
      ...ld.council_tax.council_tax_reduction,
      category: 'Benefits',
      status: 'likely'
    });

    // Local Welfare Assistance
    entitlements.push({
      id: 'lwas',
      ...ld.local_authority_support.local_welfare_assistance,
      category: 'Benefits',
      status: 'check'
    });
  }

  // Disabled Band Reduction
  if (home_adaptations === 'yes') {
    entitlements.push({
      id: 'disabled_band_reduction',
      ...ld.council_tax.disabled_band_reduction,
      category: 'Benefits',
      status: 'likely'
    });
  } else if (children.some(c => c.care === 'yes' || c.mobility === 'yes')) {
    entitlements.push({
      id: 'disabled_band_reduction_potential',
      ...ld.council_tax.disabled_band_reduction,
      name: ld.council_tax.disabled_band_reduction.name + " (Potential)",
      category: 'Benefits',
      status: 'check',
      description: "If your home has been adapted (e.g. extra bathroom, indoor wheelchair space) for your child's needs, you may be able to reduce your Council Tax band."
    });
  }

  // SMI Discount (Relevant for children 18+)
  if (children.some(c => c.age >= 18 && c.diagnosis === 'yes' && (c.care === 'yes' || c.mobility === 'yes'))) {
    entitlements.push({
      id: 'smi_discount',
      ...ld.council_tax.smi_discount,
      category: 'Benefits',
      status: 'likely'
    });
  }

  // Access Card
  if (children.some(c => c.care === 'yes' || c.mobility === 'yes' || c.diagnosis === 'yes')) {
    entitlements.push({
      id: 'access_card',
      ...ld.discounts_and_cards.access_card,
      category: 'Education Support',
      status: 'likely'
    });
  }

  // Direct Payments
  if (children.some(c => c.diagnosis === 'yes' || c.care === 'yes')) {
    entitlements.push({
      id: 'direct_payments',
      ...ld.social_care_support.direct_payments,
      category: 'Education Support',
      status: 'check'
    });
  }

  // 9. Grants & Other Support
  const grants = grantsData.grants_and_support;
  
  // Blue Badge
  if (children.some(c => c.mobility === 'yes')) {
    entitlements.push({
      id: 'blue_badge',
      name: grants.blue_badge.name,
      category: 'Education Support',
      status: 'likely',
      description: grants.blue_badge.description,
      official_url: grants.blue_badge.official_url
    });
  }

  // Motability
  if (children.some(c => c.mobility === 'yes')) {
    entitlements.push({
      id: 'motability',
      name: grants.motability_scheme.name,
      category: 'Education Support',
      status: 'check',
      description: grants.motability_scheme.description,
      official_url: grants.motability_scheme.official_url
    });
  }

  // WaterSure
  if (water_meter === 'yes' && (numChildrenNum >= 3 || children.some(c => c.care === 'yes'))) {
    entitlements.push({
      id: 'water_sure',
      name: grants.water_sure.name,
      category: 'Benefits',
      status: 'check',
      description: grants.water_sure.description
    });
  }

  // NHS Help
  if (hasUniversalCredit && householdIncomeNum < 12000) {
     entitlements.push({
      id: 'nhs_help',
      name: grants.nhs_help_with_health_costs.name,
      category: 'Benefits',
      status: 'likely',
      description: "Free prescriptions, dental, and eye tests based on your UC status.",
      official_url: grants.nhs_help_with_health_costs.official_url
    });
  }

  // Charity Grants
  charityData.charity_grants.forEach((charity, index) => {
    let isEligible = false;
    let status = 'potential';

    if (charity.charity_name === 'Family Fund') {
      if (householdIncomeNum < 35000) {
        isEligible = true;
        status = children.some(c => c.diagnosis === 'yes') ? 'likely' : 'potential';
      }
    } else if (charity.charity_name === 'Newlife the Charity for Disabled Children') {
      if (children.some(c => c.age < 19 && (c.care === 'yes' || c.mobility === 'yes' || c.diagnosis === 'yes'))) {
        isEligible = true;
      }
    } else if (charity.charity_name === 'Children Today') {
      if (children.some(c => c.age <= 25 && (c.care === 'yes' || c.mobility === 'yes' || c.diagnosis === 'yes'))) {
        isEligible = true;
      }
    } else if (charity.charity_name === 'Tree of Hope') {
      if (children.some(c => c.age <= 25 && (c.care === 'yes' || c.mobility === 'yes' || c.diagnosis === 'yes'))) {
        isEligible = true;
      }
    } else if (charity.charity_name === "Horatio's Garden") {
      if (children.some(c => c.mobility === 'yes' || c.care === 'yes')) {
        isEligible = true;
      }
    } else if (charity.charity_name === 'Turn2Us' || charity.charity_name === 'Contact') {
      isEligible = true; // Advice charities are always relevant
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
